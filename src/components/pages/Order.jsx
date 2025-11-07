import { useState, useEffect } from 'react'
import { APP_CONFIG } from '../../config'
import { fetchMatches } from '../../services/api'
import CricketMatchCard from '../CricketMatchCard'
import Alert from '../Alert'

function Order({ user, setActiveTab }) {
    const [matches, setMatches] = useState({ live: [], upcoming: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedMatch, setSelectedMatch] = useState(null)
    const [alert, setAlert] = useState({ isOpen: false, type: 'info', message: '' })
    
    // Redirect to login if not logged in
    useEffect(() => {
        if (!user && setActiveTab) {
            setActiveTab('account')
        }
    }, [user, setActiveTab])

    // Fetch cricket matches
    useEffect(() => {
        const loadMatches = async () => {
            try {
                setLoading(true)
                const response = await fetchMatches()
                if (response.success) {
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
                        live: liveMatches,
                        upcoming: upcomingMatches,
                    })
                } else {
                    setError('Failed to load matches')
                }
            } catch (err) {
                console.error('Error loading matches:', err)
                setError('Failed to load matches')
            } finally {
                setLoading(false)
            }
        }

        loadMatches()
        // Refresh every 10 seconds (frontend reads from cache, so frequent refresh is fine)
        const interval = setInterval(loadMatches, 10 * 1000)
        return () => clearInterval(interval)
    }, [])

    // If not logged in, don't render anything (redirect will happen)
    if (!user) {
        return null
    }

    const packages = [
        {
            id: 1,
            name: 'Basic Plan',
            description: 'Live matches • Score updates • Basic stats',
            price: 99
        },
        {
            id: 2,
            name: 'Premium Plan',
            description: 'Live cricket • Full statistics • Match highlights',
            price: 199
        },
        {
            id: 3,
            name: 'Pro Plan',
            description: 'All matches • Advanced stats • Expert analysis',
            price: 299
        },
        {
            id: 4,
            name: 'Elite Plan',
            description: 'Premium access • Live commentary • Video highlights',
            price: 499
        },
        {
            id: 5,
            name: 'Ultimate Plan',
            description: 'Everything included • Exclusive content • Priority support',
            price: 799
        }
    ]

    const showAlert = (type, message) => {
        setAlert({ isOpen: true, type, message })
    }

    const handleBuyPackage = (pkg) => {
        // TODO: Implement order creation logic
        showAlert('info', `Ordering ${pkg.name} for ${selectedMatch ? selectedMatch.name : 'all matches'}`)
    }

    return (
        <div className='flex flex-col py-4 px-4 pb-20'>
            {/* Compact Header */}
            <h2 className='text-2xl font-bold text-crickbuzz-text mb-3'>Order Packages</h2>
            
            {/* Cricket Matches Section */}
            <div className='mb-4'>
                <h3 className='text-sm font-bold text-crickbuzz-text mb-2'>Select Match (Optional)</h3>
                
                {/* Loading State */}
                {loading && (
                    <div className='bg-crickbuzz-light rounded-lg p-4 text-center mb-3'>
                        <p className='text-xs text-crickbuzz-text-light'>Loading matches...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className='bg-red-50 border border-red-200 rounded-lg p-3 mb-3'>
                        <p className='text-xs text-red-600'>{error}</p>
                    </div>
                )}

                {/* Live Matches */}
                {!loading && !error && matches.live && matches.live.length > 0 && (
                    <div className='mb-3'>
                        <div className='flex items-center justify-between mb-2'>
                            <h4 className='text-xs font-semibold text-crickbuzz-text flex items-center gap-2'>
                                <span className='w-2 h-2 bg-red-600 rounded-full animate-pulse'></span>
                                Live Matches
                            </h4>
                        </div>
                        <div className='space-y-1 max-h-48 overflow-y-auto'>
                            {matches.live.map((match, index) => (
                                <div 
                                    key={match.id || match.matchId || index}
                                    onClick={() => setSelectedMatch(match)}
                                    className={`cursor-pointer transition-all ${
                                        selectedMatch?.id === match.id ? 'ring-2 ring-crickbuzz-green' : ''
                                    }`}
                                >
                                    <CricketMatchCard match={match} isLive={true} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upcoming Matches */}
                {!loading && !error && matches.upcoming && matches.upcoming.length > 0 && (
                    <div className='mb-3'>
                        <div className='flex items-center justify-between mb-2'>
                            <h4 className='text-xs font-semibold text-crickbuzz-text'>
                                Upcoming Matches
                            </h4>
                        </div>
                        <div className='space-y-1 max-h-48 overflow-y-auto'>
                            {matches.upcoming.map((match, index) => (
                                <div 
                                    key={match.id || match.matchId || index}
                                    onClick={() => setSelectedMatch(match)}
                                    className={`cursor-pointer transition-all ${
                                        selectedMatch?.id === match.id ? 'ring-2 ring-crickbuzz-green' : ''
                                    }`}
                                >
                                    <CricketMatchCard match={match} isLive={false} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Matches State */}
                {!loading && !error && matches.live.length === 0 && matches.upcoming.length === 0 && (
                    <div className='bg-crickbuzz-light rounded-lg p-4 text-center mb-3'>
                        <p className='text-xs text-crickbuzz-text-light'>No matches available. Packages will apply to all matches.</p>
                    </div>
                )}
            </div>

            {/* Selected Match Info */}
            {selectedMatch && (
                <div className='bg-crickbuzz-green bg-opacity-10 border border-crickbuzz-green rounded-lg p-3 mb-4'>
                    <p className='text-xs font-semibold text-crickbuzz-text mb-1'>Selected Match:</p>
                    <p className='text-sm text-crickbuzz-text'>{selectedMatch.name}</p>
                    <button 
                        onClick={() => setSelectedMatch(null)}
                        className='text-xs text-crickbuzz-green mt-2 hover:underline'
                    >
                        Clear Selection
                    </button>
                </div>
            )}
            
            {/* Packages */}
            <div className='mb-3'>
                <h3 className='text-sm font-bold text-crickbuzz-text mb-2'>Available Packages</h3>
                <div className='space-y-2'>
                    {packages.map((pkg) => (
                        <div key={pkg.id} className='bg-crickbuzz-light rounded-lg p-3'>
                            <div className='flex justify-between items-start'>
                                <div className='flex-1'>
                                    <h3 className='text-sm font-semibold text-crickbuzz-text'>{pkg.name}</h3>
                                    <p className='text-xs text-crickbuzz-text-light mt-0.5'>{pkg.description}</p>
                                    <p className='text-crickbuzz-green font-bold text-base mt-2'>{APP_CONFIG.currency}{pkg.price}</p>
                                </div>
                                <button 
                                    onClick={() => handleBuyPackage(pkg)}
                                    className='bg-crickbuzz-green text-white font-semibold py-1.5 px-4 rounded-lg hover:bg-crickbuzz-green-dark transition-colors text-xs ml-2'
                                >
                                    Buy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
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

export default Order
