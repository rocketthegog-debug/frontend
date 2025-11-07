import { useState, useEffect } from 'react'
import { APP_CONFIG } from '../../config'
import HeroCarousel from '../HeroCarousel'
import { IoWalletOutline, IoAddCircleOutline, IoRemoveCircleOutline, IoArrowDownOutline, IoArrowUpOutline } from 'react-icons/io5'
import { fetchMatches, getUserTransactions, fetchMatchDetails } from '../../services/api'
import CricketMatchCard from '../CricketMatchCard'
import MatchDetailsModal from '../MatchDetailsModal'

function Home({ user, setActiveTab, walletBalance, refreshWalletBalance }) {
    const [matches, setMatches] = useState({ live: [], upcoming: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [loadingTransactions, setLoadingTransactions] = useState(false)
    const [activeMatchTab, setActiveMatchTab] = useState('live') // 'live' or 'upcoming'
    const [selectedMatch, setSelectedMatch] = useState(null)
    const [matchDetails, setMatchDetails] = useState(null)
    const [loadingDetails, setLoadingDetails] = useState(false)

    // Redirect to login if not logged in
    useEffect(() => {
        if (!user) {
            setActiveTab('account')
        }
    }, [user, setActiveTab])

    // If not logged in, don't render anything (redirect will happen)
    if (!user) {
        return null
    }

    // Fetch cricket matches
    useEffect(() => {
        const loadMatches = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await fetchMatches()
                if (response.success) {
                    // Handle different API response formats
                    const liveMatches = Array.isArray(response.data?.live) 
                        ? response.data.live 
                        : Array.isArray(response.data?.live?.data) 
                        ? response.data.live.data 
                        : []
                    
                    const upcomingMatches = Array.isArray(response.data?.upcoming) 
                        ? response.data.upcoming 
                        : Array.isArray(response.data?.upcoming?.data) 
                        ? response.data.upcoming.data 
                        : []
                    
                    setMatches({
                        live: liveMatches.slice(0, 3), // Show only 3 live matches
                        upcoming: upcomingMatches.slice(0, 3), // Show only 3 upcoming matches
                    })
                    
                    // Show rate limit message if present
                    if (response.message && response.rateLimit) {
                        setError(response.message)
                    }
                } else {
                    setError('Failed to load matches')
                }
            } catch (err) {
                console.error('Error loading matches:', err)
                setError('Failed to load matches. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        loadMatches()
        // Refresh every 30 seconds (frontend reads from cache, so moderate refresh is fine)
        const interval = setInterval(loadMatches, 30 * 1000)
        return () => clearInterval(interval)
    }, [])

    const loadTransactions = async () => {
        if (!user?.phone) return
        try {
            setLoadingTransactions(true)
            const response = await getUserTransactions(user.phone)
            if (response.success) {
                // Get latest 5 transactions
                const recentTransactions = (response.data || []).slice(0, 5)
                setTransactions(recentTransactions)
            }
        } catch (error) {
            console.error('Error loading transactions:', error)
        } finally {
            setLoadingTransactions(false)
        }
    }

    // Fetch user transactions
    useEffect(() => {
        if (user?.phone) {
            loadTransactions()
        }
    }, [user?.phone])

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
                return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
            }
        } catch {
            return dateString
        }
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 17) return 'Good Afternoon'
        if (hour < 21) return 'Good Evening'
        return 'Good Night'
    }

    const handleRecharge = () => {
        setActiveTab('recharge')
    }

    const handleWithdraw = () => {
        setActiveTab('withdrawal')
    }

    const handleMatchClick = async (match) => {
        setSelectedMatch(match)
        if (match.id || match.matchId) {
            try {
                setLoadingDetails(true)
                const response = await fetchMatchDetails(match.id || match.matchId)
                console.log('🔍 Frontend (Home) - Match details response:', {
                    success: response.success,
                    hasData: !!response.data,
                    dataStructure: response.data ? Object.keys(response.data) : [],
                    nestedData: response.data?.data ? Object.keys(response.data.data) : [],
                    playersCount: response.data?.data?.players?.length || 0,
                    team1SquadCount: response.data?.data?.team1Squad?.length || 0,
                })
                if (response.success) {
                    setMatchDetails(response.data)
                }
            } catch (err) {
                console.error('Error loading match details:', err)
            } finally {
                setLoadingDetails(false)
            }
        }
    }

    const handleCloseModal = () => {
        setSelectedMatch(null)
        setMatchDetails(null)
    }

    return (
        <div className='flex flex-col px-4 pb-20'>
            {/* App Name Header */}
            <div className='pt-4 pb-3'>
                <h2 className='text-xl font-bold text-crickbuzz-text'>{APP_CONFIG.appName}</h2>
            </div>

            {/* Only show data if logged in */}
            {user ? (
                <>
                    {/* Quick Account View - Compact */}
                    <div className='bg-crickbuzz-green text-white rounded-lg p-3 mb-4'>
                        <p className='text-xs opacity-90 mb-1'>{getGreeting()}, {user.name}!</p>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-xs opacity-75 mb-0.5'>ID: {user.phone || 'N/A'}</p>
                                <div className='flex items-center gap-1.5 mt-1'>
                                    <IoWalletOutline className='text-base' />
                                    <p className='text-lg font-bold'>{APP_CONFIG.currency} {walletBalance.toLocaleString()}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveTab('account')}
                                className='bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-semibold hover:bg-opacity-30 transition-colors'
                            >
                                View
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions - Recharge & Withdraw */}
                    <div className='grid grid-cols-2 gap-2 mb-4'>
                        <button
                            onClick={handleRecharge}
                            className='bg-crickbuzz-green text-white rounded-lg p-2.5 flex items-center justify-center gap-1.5 hover:bg-crickbuzz-green-dark transition-colors'
                        >
                            <IoAddCircleOutline className='text-lg' />
                            <span className='text-xs font-semibold'>Recharge</span>
                        </button>
                        <button
                            onClick={handleWithdraw}
                            className='bg-amber-500 text-white rounded-lg p-2.5 flex items-center justify-center gap-1.5 hover:bg-amber-600 transition-colors'
                        >
                            <IoRemoveCircleOutline className='text-lg' />
                            <span className='text-xs font-semibold'>Withdraw</span>
                        </button>
                    </div>
                </>
            ) : null}

            {/* Hero Carousel */}
            <div className='mb-4'>
                <HeroCarousel />
            </div>

            {/* Cricket Matches Section */}
            <div className='mb-4'>
                {/* Loading State */}
                {loading && (
                    <div className='bg-crickbuzz-light rounded-lg p-4 text-center mb-3'>
                        <p className='text-xs text-crickbuzz-text-light'>Loading matches...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className='bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3'>
                        <p className='text-xs text-amber-700 font-semibold mb-1'>⚠️ {error}</p>
                        {error.includes('rate limited') && (
                            <p className='text-xs text-amber-600'>
                                The system will automatically retry. Please check back in a few minutes.
                            </p>
                        )}
                    </div>
                )}

                {/* Matches Tabs and Grid - Show if we have any matches */}
                {!loading && !error && (matches.live.length > 0 || matches.upcoming.length > 0) && (
                    <div>
                        {/* Tabs */}
                        <div className='flex gap-2 mb-3 border-b border-crickbuzz-light'>
                            <button
                                onClick={() => setActiveMatchTab('live')}
                                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                                    activeMatchTab === 'live'
                                        ? 'text-crickbuzz-green border-b-2 border-crickbuzz-green'
                                        : 'text-crickbuzz-text-light hover:text-crickbuzz-text'
                                }`}
                            >
                                <span className='flex items-center gap-1.5'>
                                    {activeMatchTab === 'live' && (
                                        <span className='w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse'></span>
                                    )}
                                    Live ({matches.live.length})
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveMatchTab('upcoming')}
                                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                                    activeMatchTab === 'upcoming'
                                        ? 'text-crickbuzz-green border-b-2 border-crickbuzz-green'
                                        : 'text-crickbuzz-text-light hover:text-crickbuzz-text'
                                }`}
                            >
                                Upcoming ({matches.upcoming.length})
                            </button>
                        </div>

                        {/* Matches Carousel - 1 card full width with snap scroll */}
                        <div className='relative'>
                            <div className='flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide snap-scroll pb-2 items-stretch'>
                                {/* Show matches based on active tab */}
                                {(activeMatchTab === 'live' ? matches.live : matches.upcoming).map((match, index) => (
                                    <div 
                                        key={match.id || match.matchId || index} 
                                        className='flex-shrink-0 w-full snap-start px-1 h-full cursor-pointer'
                                        onClick={() => handleMatchClick(match)}
                                    >
                                        <CricketMatchCard 
                                            match={match} 
                                            isLive={activeMatchTab === 'live'} 
                                        />
                                    </div>
                                ))}
                                
                                {/* Show More Button - Always show if we have at least 1 match */}
                                {((activeMatchTab === 'live' ? matches.live : matches.upcoming).length > 0) && (
                                    <div className='flex-shrink-0 w-full snap-start px-1 h-full'>
                                        <button
                                            onClick={() => setActiveTab('matches')}
                                            className='w-full h-full bg-white rounded-lg p-4 flex flex-col items-center justify-center'
                                        >
                                            <span className='text-xs font-semibold text-crickbuzz-text'>
                                                Show More
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* No Matches State */}
                {!loading && !error && matches.live.length === 0 && matches.upcoming.length === 0 && (
                    <div className='bg-crickbuzz-light rounded-lg p-4 text-center'>
                        <p className='text-xs text-crickbuzz-text-light'>No matches available at the moment</p>
                    </div>
                )}
            </div>

            {/* Recent Transactions */}
            {user ? (
                <>
                    <div className='mb-4'>
                        <div className='flex items-center justify-between mb-2'>
                            <p className='text-xs font-bold text-crickbuzz-text uppercase tracking-wide'>Recent</p>
                            <button
                                onClick={() => setActiveTab('account')}
                                className='text-xs text-crickbuzz-green font-semibold hover:underline'
                            >
                                View All
                            </button>
                        </div>
                        {loadingTransactions ? (
                            <div className='bg-crickbuzz-light rounded-lg p-4 text-center'>
                                <p className='text-xs text-crickbuzz-text-light'>Loading transactions...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className='bg-crickbuzz-light rounded-lg p-4 text-center'>
                                <p className='text-xs text-crickbuzz-text-light'>No transactions yet</p>
                            </div>
                        ) : (
                            <div className='space-y-1'>
                                {transactions.map((tx) => {
                                    const isPositive = tx.paymentType === 'recharge' || tx.paymentType === 'click-earn' || tx.paymentType === 'order'
                                    const getLabel = (type) => {
                                        switch (type) {
                                            case 'recharge': return 'Recharge'
                                            case 'withdrawal': return 'Withdrawal'
                                            case 'click-earn': return 'Click Earn'
                                            case 'order': return 'Order'
                                            default: return type.charAt(0).toUpperCase() + type.slice(1)
                                        }
                                    }
                                    return (
                                        <div key={tx._id} className='bg-crickbuzz-light rounded-lg p-2 flex items-center justify-between'>
                                            <div className='flex items-center gap-2 flex-1'>
                                                <div className={`rounded-full p-1.5 ${
                                                    isPositive ? 'bg-crickbuzz-green' : 'bg-amber-500'
                                                }`}>
                                                    {isPositive ? (
                                                        <IoArrowUpOutline className='text-white text-xs' />
                                                    ) : (
                                                        <IoArrowDownOutline className='text-white text-xs' />
                                                    )}
                                                </div>
                                                <div className='flex-1'>
                                                    <p className='text-xs font-semibold text-crickbuzz-text'>{getLabel(tx.paymentType)}</p>
                                                    <p className='text-xs text-crickbuzz-text-light'>{formatDate(tx.createdAt)}</p>
                                                    {tx.status && (
                                                        <p className={`text-xs font-semibold ${
                                                            tx.status === 'completed' ? 'text-green-600' :
                                                            tx.status === 'processing' ? 'text-amber-600' :
                                                            tx.status === 'cancelled' || tx.status === 'failed' ? 'text-red-600' :
                                                            'text-gray-600'
                                                        }`}>
                                                            {tx.status}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className={`text-xs font-bold ${
                                                isPositive ? 'text-crickbuzz-green' : 'text-amber-600'
                                            }`}>
                                                {isPositive ? '+' : '-'}{APP_CONFIG.currency}{tx.amount}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Welcome message when not logged in */
                <div className='text-center py-6'>
                    <p className='text-sm font-semibold text-crickbuzz-text mb-2'>Welcome to {APP_CONFIG.appName}!</p>
                    <p className='text-xs text-crickbuzz-text-light'>Please login to view your account details</p>
                </div>
            )}

            {/* Match Details Modal */}
            <MatchDetailsModal
                match={selectedMatch}
                matchDetails={matchDetails}
                isOpen={!!selectedMatch}
                onClose={handleCloseModal}
                isLive={activeMatchTab === 'live'}
                loadingDetails={loadingDetails}
            />
        </div>
    )
}

export default Home
