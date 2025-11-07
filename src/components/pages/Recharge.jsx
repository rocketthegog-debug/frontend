import { useState, useRef, useEffect } from 'react'
import { APP_CONFIG } from '../../config'
import { createRecharge, getUserTransactions } from '../../services/api'
import { IoTimeOutline } from 'react-icons/io5'

function Recharge({ user, refreshWalletBalance, setActiveTab, setPaymentData }) {
    const [amount, setAmount] = useState('')
    const [error, setError] = useState('')
    const [showIndicator, setShowIndicator] = useState(true)
    const [loading, setLoading] = useState(false)
    const [rechargeTransactions, setRechargeTransactions] = useState([])
    const [loadingTransactions, setLoadingTransactions] = useState(false)
    const scrollRef = useRef(null)

    const quickAmounts = [100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000]

    useEffect(() => {
        const checkScroll = () => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
                // Hide indicator when scrolled to the end
                const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 5
                setShowIndicator(!isAtEnd)
            }
        }

        const element = scrollRef.current
        if (element) {
            element.addEventListener('scroll', checkScroll)
            // Check initial state
            checkScroll()
            return () => element.removeEventListener('scroll', checkScroll)
        }
    }, [])

    const handleAmountChange = (e) => {
        const value = e.target.value
        
        // Only allow numbers
        if (value === '' || /^\d+$/.test(value)) {
            setAmount(value)
            setError('')
            
            // Validate only if value is not empty
            if (value !== '') {
                const numValue = parseInt(value)
                
                // Check minimum
                if (numValue < 100) {
                    setError('Minimum recharge amount is ₹100')
                    return
                }
                
                // Check multiple of 10
                if (numValue % 10 !== 0) {
                    setError('Amount must be a multiple of 10')
                    return
                }
            }
        }
    }

    const handleRecharge = async () => {
        const numAmount = parseInt(amount)
        
        // Final validation before recharge
        if (!amount || amount === '') {
            setError('Please enter an amount')
            return
        }
        
        if (numAmount < 100) {
            setError('Minimum recharge amount is ₹100')
            return
        }
        
        if (numAmount % 10 !== 0) {
            setError('Amount must be a multiple of 10')
            return
        }
        
        if (!user?.phone) {
            setError('User not authenticated')
            return
        }

        try {
            setLoading(true)
            setError('')

            // Create recharge transaction in backend with "processing" status
            const response = await createRecharge(
                user.phone,
                numAmount
            )

            if (response.success) {
                // Reload transactions to show the new one
                await loadRechargeTransactions()
                
                // Navigate directly to payment page with transaction data
                if (setPaymentData && setActiveTab) {
                    setPaymentData({
                        amount: numAmount,
                        transaction: response.data
                    })
                    setActiveTab('payment')
                }
                // Clear form
                setAmount('')
            } else {
                // Show detailed error message
                const errorMessage = response.message || 'Failed to create recharge request'
                const errorDetails = response.error ? `\n\nError: ${response.error}` : ''
                setError(errorMessage + errorDetails)
                console.error('Recharge failed:', response)
            }
        } catch (err) {
            console.error('Error creating recharge:', err)
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    
    const loadRechargeTransactions = async () => {
        if (!user?.phone) return
        try {
            setLoadingTransactions(true)
            const response = await getUserTransactions(user.phone, null, 'recharge')
            if (response.success) {
                // Get latest 3 recharge transactions
                const recharges = (response.data || []).slice(0, 3) // Show latest 3
                setRechargeTransactions(recharges)
            }
        } catch (error) {
            console.error('Error loading recharge transactions:', error)
        } finally {
            setLoadingTransactions(false)
        }
    }

    // Format date for display
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString)
            const now = new Date()
            const diffTime = Math.abs(now - date)
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
            
            if (diffDays === 0) {
                const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
                if (diffHours === 0) {
                    const diffMinutes = Math.floor(diffTime / (1000 * 60))
                    return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`
                }
                return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
            } else if (diffDays === 1) {
                return 'Yesterday'
            } else if (diffDays < 7) {
                return `${diffDays} days ago`
            } else {
                return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
            }
        } catch {
            return dateString
        }
    }

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-50'
            case 'processing':
            case 'pending':
                return 'text-amber-600 bg-amber-50'
            case 'cancelled':
            case 'failed':
                return 'text-red-600 bg-red-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }


    // Redirect to login if not logged in
    useEffect(() => {
        if (!user && setActiveTab) {
            setActiveTab('account')
        }
    }, [user, setActiveTab])

    // Load recharge transactions when component mounts or user changes
    useEffect(() => {
        if (user?.phone) {
            loadRechargeTransactions()
        }
    }, [user])

    // If not logged in, don't render anything (redirect will happen)
    if (!user) {
        return null
    }

    return (
        <div className='flex flex-col py-4 px-4 pb-20'>
            {/* Compact Header */}
            <h2 className='text-2xl font-bold text-crickbuzz-text mb-3'>Recharge Wallet</h2>
            
            {/* Input Card */}
            <div className='bg-crickbuzz-light rounded-lg p-3 mb-3'>
                <label className='block text-xs font-semibold text-crickbuzz-text mb-2'>
                    Enter or Select Amount <span className='text-crickbuzz-text-light font-normal'>(Min ₹100, Multiple of 10)</span>
                </label>
                <input
                    type='text'
                    inputMode='numeric'
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder={`${APP_CONFIG.currency} 0`}
                    className={`w-full bg-white rounded-lg px-3 py-2 text-crickbuzz-text placeholder-crickbuzz-text-light focus:outline-none focus:ring-2 focus:ring-opacity-30 text-sm transition-all ${
                        error ? 'focus:ring-red-500 border border-red-200' : 'focus:ring-crickbuzz-green'
                    }`}
                />
                {error && (
                    <p className='text-xs text-red-600 font-medium mt-2'>{error}</p>
                )}
            </div>

            {/* Quick Amounts - Horizontal Scrollable with Indicator */}
            <div className='mb-3'>
                <p className='text-xs font-bold text-crickbuzz-text mb-2 uppercase tracking-wide'>Quick Amounts</p>
                <style>{`
                    .amount-scroll::-webkit-scrollbar {
                        display: none;
                    }
                    .amount-scroll {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    @keyframes slideLeftToRight {
                        0%, 100% {
                            transform: translateX(-4px);
                        }
                        50% {
                            transform: translateX(4px);
                        }
                    }
                    .scroll-indicator {
                        animation: slideLeftToRight 1.5s ease-in-out infinite;
                    }
                `}</style>
                <div className='relative flex items-center h-9'>
                    <div 
                        ref={scrollRef}
                        className='amount-scroll flex gap-2 overflow-x-auto w-full items-center'
                        dir='ltr'
                    >
                        {quickAmounts.map((amt) => (
                            <button
                                key={amt}
                                onClick={() => setAmount(amt.toString())}
                                className='flex-shrink-0 bg-white border-2 border-crickbuzz-border p-2 rounded-lg hover:bg-crickbuzz-green hover:text-white hover:border-crickbuzz-green font-semibold transition-all text-xs whitespace-nowrap h-fit'
                            >
                                {APP_CONFIG.currency}{amt}
                            </button>
                        ))}
                    </div>
                    {/* Scroll Indicator - Only show if not at end */}
                    {showIndicator && (
                        <div className='absolute right-0 top-0 bottom-0 flex items-center justify-center bg-gradient-to-l from-white via-white to-transparent pointer-events-none w-12'>
                            <span className='scroll-indicator text-crickbuzz-green font-bold text-3xl leading-none'>›</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Recharge Button */}
            <button 
                onClick={handleRecharge}
                disabled={loading || !amount || error !== '' || (amount && (parseInt(amount) < 100 || parseInt(amount) % 10 !== 0))}
                className={`w-full font-bold py-2.5 rounded-lg transition-colors text-sm mb-4 ${
                    loading || !amount || error !== '' || (amount && (parseInt(amount) < 100 || parseInt(amount) % 10 !== 0))
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-crickbuzz-green text-white hover:bg-crickbuzz-green-dark'
                }`}
            >
                {loading ? 'Processing...' : `Recharge ${APP_CONFIG.currency}${amount || '0'}`}
            </button>

            {/* Recent Recharges */}
            <div className='mt-2'>
                <div className='flex items-center justify-between mb-2'>
                    <p className='text-xs font-bold text-crickbuzz-text uppercase tracking-wide'>Recent Recharges</p>
                    <button
                        onClick={loadRechargeTransactions}
                        disabled={loadingTransactions}
                        className='text-xs text-crickbuzz-green font-semibold hover:underline disabled:opacity-50'
                    >
                        {loadingTransactions ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
                {loadingTransactions ? (
                    <div className='bg-crickbuzz-light rounded-lg p-4 text-center'>
                        <p className='text-xs text-crickbuzz-text-light'>Loading transactions...</p>
                    </div>
                ) : rechargeTransactions.length === 0 ? (
                    <div className='bg-crickbuzz-light rounded-lg p-4 text-center'>
                        <p className='text-xs text-crickbuzz-text-light'>No recharge transactions yet</p>
                    </div>
                ) : (
                    <div className='space-y-2'>
                        {rechargeTransactions.map((tx) => (
                            <div key={tx._id} className='bg-crickbuzz-light rounded-lg p-3'>
                                <div className='flex items-start justify-between mb-2'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <p className='text-xs font-bold text-crickbuzz-text'>
                                                {APP_CONFIG.currency} {tx.amount}
                                            </p>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(tx.status)}`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex items-center gap-1 text-xs text-crickbuzz-text-light'>
                                    <IoTimeOutline className='text-xs' />
                                    <span>{formatDate(tx.createdAt)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}

export default Recharge
