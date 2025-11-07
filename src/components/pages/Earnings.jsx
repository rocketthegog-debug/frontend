import { useState, useEffect, useCallback } from 'react'
import { APP_CONFIG } from '../../config'
import { getEarningsSummary, getEarningsHistory, clickToEarn, getClickStats } from '../../services/api'
import { IoCashOutline, IoStatsChartOutline, IoCalendarOutline, IoHandLeftOutline, IoTimeOutline } from 'react-icons/io5'
import Alert from '../Alert'

function Earnings({ user, setActiveTab, refreshWalletBalance }) {
    const [earnings, setEarnings] = useState({
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
    })
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('all') // 'all', 'today', 'week', 'month'
    const [clickStats, setClickStats] = useState({
        clicksToday: 0,
        maxClicks: 0,
        clicksRemaining: 0,
        canEarn: false,
        tier: 'none',
        maxEarning: 0,
    })
    const [earning, setEarning] = useState(false)
    const [lastEarning, setLastEarning] = useState(null)
    const [alert, setAlert] = useState({ isOpen: false, type: 'info', message: '' })
    const [cooldown, setCooldown] = useState({ active: false, remaining: 0, minutes: 0 })
    const [consecutiveClicks, setConsecutiveClicks] = useState(0)

    const loadEarnings = useCallback(async () => {
        if (!user?.phone) return
        try {
            setLoading(true)
            
            // Get earnings summary from backend
            const summaryResponse = await getEarningsSummary(user.phone)
            
            if (summaryResponse.success) {
                setEarnings({
                    total: summaryResponse.data.total || 0,
                    today: summaryResponse.data.today || 0,
                    thisWeek: summaryResponse.data.thisWeek || 0,
                    thisMonth: summaryResponse.data.thisMonth || 0,
                })
            }

            // Get recent earnings history (limit to 10, always show 'all')
            const historyResponse = await getEarningsHistory(user.phone, 'all', 10)
            
            if (historyResponse.success) {
                setTransactions(historyResponse.data || [])
            }
        } catch (error) {
            console.error('Error loading earnings:', error)
        } finally {
            setLoading(false)
        }
    }, [user?.phone])

    const loadClickStats = useCallback(async () => {
        if (!user?.phone) return
        try {
            const response = await getClickStats(user.phone)
            if (response.success) {
                setClickStats(response.data)
                
                // Check cooldown from database
                if (response.data.isCooldownActive && response.data.cooldownUntil) {
                    const cooldownUntil = new Date(response.data.cooldownUntil)
                    const now = Date.now()
                    const cooldownRemaining = Math.max(0, Math.ceil((cooldownUntil.getTime() - now) / 1000))
                    
                    if (cooldownRemaining > 0) {
                        setCooldown({
                            active: true,
                            remaining: cooldownRemaining,
                            minutes: Math.ceil(cooldownRemaining / 60),
                        })
                    } else {
                        setCooldown({ active: false, remaining: 0, minutes: 0 })
                    }
                } else {
                    setCooldown({ active: false, remaining: 0, minutes: 0 })
                }
                
                // Update consecutive clicks
                if (response.data.consecutiveClicks) {
                    setConsecutiveClicks(response.data.consecutiveClicks)
                }
            }
        } catch (error) {
            console.error('Error loading click stats:', error)
        }
    }, [user?.phone])

    // Cooldown countdown timer
    useEffect(() => {
        if (cooldown.active && cooldown.remaining > 0) {
            const timer = setInterval(() => {
                setCooldown(prev => {
                    if (prev.remaining <= 1) {
                        // Reload stats when cooldown expires to get fresh data from database
                        loadClickStats()
                        return { active: false, remaining: 0, minutes: 0 }
                    }
                    return {
                        ...prev,
                        remaining: prev.remaining - 1,
                        minutes: Math.ceil((prev.remaining - 1) / 60),
                    }
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [cooldown.active, cooldown.remaining, loadClickStats])

    // Periodically sync cooldown with database (every 60 seconds when active)
    useEffect(() => {
        if (user?.phone && cooldown.active) {
            const syncInterval = setInterval(() => {
                loadClickStats()
            }, 60000) // Sync every 60 seconds to reduce API calls
            return () => clearInterval(syncInterval)
        }
    }, [user?.phone, cooldown.active, loadClickStats])

    useEffect(() => {
        if (user?.phone) {
            loadEarnings()
            loadClickStats()
        }
    }, [user?.phone, loadEarnings, loadClickStats])

    const showAlert = (type, message) => {
        setAlert({ isOpen: true, type, message })
    }

    const handleClickToEarn = async () => {
        if (!user?.phone || earning || cooldown.active) return
        
        try {
            setEarning(true)
            const response = await clickToEarn(user.phone)
            
            if (response.success) {
                setLastEarning({
                    amount: response.data.earningAmount,
                    message: response.message,
                })
                
                // Update consecutive clicks
                if (response.data.consecutiveClicks) {
                    setConsecutiveClicks(response.data.consecutiveClicks)
                }
                
                // Check for cooldown warning
                if (response.data.cooldownWarning) {
                    showAlert('warning', response.data.cooldownWarning)
                }
                
                // Reload earnings and stats
                await loadEarnings()
                await loadClickStats()
                // Refresh wallet balance in parent component
                if (refreshWalletBalance) {
                    await refreshWalletBalance()
                }
                // Clear success message after 3 seconds
                setTimeout(() => {
                    setLastEarning(null)
                }, 3000)
            } else {
                // Handle cooldown error (429 status)
                if (response.status === 429 || response.data?.cooldownRemaining) {
                    const cooldownSeconds = response.data?.cooldownRemaining || 120
                    setCooldown({
                        active: true,
                        remaining: cooldownSeconds,
                        minutes: Math.ceil(cooldownSeconds / 60),
                    })
                    showAlert('warning', response.message || 'Please wait before clicking again.')
                } else {
                    showAlert('error', response.message || 'Failed to earn. Please try again.')
                }
            }
        } catch (error) {
            console.error('Error clicking to earn:', error)
            // Check if it's a cooldown error
            if (error.response?.status === 429 || error.data?.cooldownRemaining) {
                const cooldownSeconds = error.data?.cooldownRemaining || 120
                setCooldown({
                    active: true,
                    remaining: cooldownSeconds,
                    minutes: Math.ceil(cooldownSeconds / 60),
                })
                showAlert('warning', 'Please wait before clicking again.')
            } else {
                showAlert('error', 'Failed to process click. Please try again.')
            }
        } finally {
            setEarning(false)
        }
    }

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return dateString
        }
    }

    // Redirect to login if not logged in
    useEffect(() => {
        if (!user && setActiveTab) {
            setActiveTab('account')
        }
    }, [user, setActiveTab])

    // If not logged in, don't render anything (redirect will happen)
    if (!user) {
        return null
    }

    return (
        <div className='flex flex-col'>
            {/* Sticky Total Earnings Card */}
            <div className='sticky top-0 z-10 relative'>
                <div className='w-full pb-2 px-4' style={{ background: 'linear-gradient(to bottom, white 0%, white 96%, transparent 100%)' }}>
                    <h2 className='text-xl font-bold text-crickbuzz-text mb-3 pt-4'>Earnings</h2>
                    <div className='bg-gradient-to-r from-crickbuzz-green to-green-600 rounded-xl p-4 shadow-md'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div className='bg-white/20 rounded-full p-2'>
                                    <IoCashOutline className='text-white text-lg' />
                    </div>
                                <div>
                                    <p className='text-xs text-white/90 font-medium'>Total Earnings</p>
                                    <p className='text-xl font-bold text-white'>{APP_CONFIG.currency} {earnings.total.toLocaleString()}</p>
                </div>
                    </div>
                </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className='px-4 pb-20'>
                {/* Earn Button Section - Compact */}
                <div className='mb-4 mt-2'>
                    {lastEarning && (
                        <div className='bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg mb-2 text-center'>
                            <p className='text-xs font-bold'>{lastEarning.message}</p>
                        </div>
                    )}
                    
                    <div className='bg-gradient-to-br from-crickbuzz-green to-green-600 rounded-xl p-4 text-center shadow-lg'>
                        <div className='flex items-center justify-between mb-3'>
                            <div className='flex items-center gap-2'>
                                <IoHandLeftOutline className='text-xl text-white' />
                                <h3 className='text-sm font-bold text-white'>Click to Earn</h3>
                            </div>
                            {clickStats.canEarn && clickStats.clicksRemaining > 0 && (
                                <div className='text-xs text-white/90'>
                                    {clickStats.clicksToday} / {clickStats.maxClicks}
                                </div>
                            )}
                        </div>
                        
                        {clickStats.canEarn ? (
                            <>
                                {clickStats.clicksRemaining > 0 ? (
                                    <>
                <button
                                            onClick={handleClickToEarn}
                                            disabled={earning || cooldown.active}
                                            className={`w-full bg-white text-crickbuzz-green py-2.5 px-4 rounded-lg font-bold text-sm shadow-md transition-all ${
                                                earning || cooldown.active
                                                    ? 'opacity-50 cursor-not-allowed' 
                                                    : 'hover:bg-gray-100 hover:scale-105 active:scale-95'
                                            }`}
                                        >
                                            {earning ? 'Processing...' : cooldown.active ? (
                                                <span className='flex items-center justify-center gap-1.5'>
                                                    <IoTimeOutline className='text-base' />
                                                    <span>Wait {Math.floor(cooldown.remaining / 60)}:{(cooldown.remaining % 60).toString().padStart(2, '0')}</span>
                                                </span>
                                            ) : 'Earn Now'}
                </button>
                                        
                                        {consecutiveClicks >= 4 && !cooldown.active && (
                                            <p className='text-[10px] text-white/70 text-center mt-2'>⚠️ {5 - consecutiveClicks} click(s) until cooldown</p>
                                        )}
                                    </>
                                ) : (
                                    <div className='bg-white/20 text-white py-2 px-3 rounded-lg'>
                                        <p className='text-xs font-semibold'>Daily Limit Reached</p>
                                        <p className='text-xs mt-0.5 opacity-90'>Come back tomorrow!</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className='text-white'>
                                <p className='text-xs mb-1'>Minimum ₹100 balance required</p>
                                <p className='text-xs opacity-90'>Recharge to start earning</p>
                            </div>
                        )}
                    </div>
            </div>

                {/* Earnings History */}
            <div className='mb-2'>
                    <p className='text-xs font-semibold text-crickbuzz-text mb-2'>Recent Earnings</p>
            </div>

            {loading ? (
                    <div className='text-center py-6'>
                        <p className='text-xs text-crickbuzz-text-light'>Loading...</p>
                </div>
            ) : transactions.length === 0 ? (
                    <div className='bg-crickbuzz-light rounded-lg p-6 text-center'>
                        <p className='text-xs text-crickbuzz-text-light'>No earnings yet</p>
                </div>
            ) : (
                    <div className='space-y-2 mb-4'>
                        {transactions.slice(0, 10).map((tx) => (
                        <div key={tx._id} className='bg-crickbuzz-light rounded-lg p-3 border border-gray-200'>
                                <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <div className='bg-crickbuzz-green rounded-full p-1.5'>
                                        <IoCashOutline className='text-white text-xs' />
                                    </div>
                                    <div>
                                            <p className='text-xs font-semibold text-crickbuzz-text'>
                                                {tx.paymentType === 'click-earn' ? 'Click Earn' : 'Order'}
                                            </p>
                                        <p className='text-xs text-crickbuzz-text-light'>{formatDate(tx.createdAt)}</p>
                                    </div>
                                </div>
                                <p className='text-sm font-bold text-crickbuzz-green'>
                                        +{APP_CONFIG.currency}{tx.amount.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>

            {/* Alert Component */}
            <Alert
                isOpen={alert.isOpen}
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ ...alert, isOpen: false })}
            />
        </div>
    )
}

export default Earnings

