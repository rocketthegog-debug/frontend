import { useState, useEffect } from 'react'
import { fetchMatches, fetchMatchDetails } from '../../services/api'
import CricketMatchCard from '../CricketMatchCard'
import MatchDetailsModal from '../MatchDetailsModal'

function Matches({ user, setActiveTab }) {
    const [matches, setMatches] = useState({ live: [], upcoming: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedTab, setSelectedTab] = useState('live') // 'live' or 'upcoming'
    const [selectedMatch, setSelectedMatch] = useState(null)
    const [matchDetails, setMatchDetails] = useState(null)
    const [loadingDetails, setLoadingDetails] = useState(false)

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
                setError(null)
                const response = await fetchMatches()
                
                // Debug logging
                console.log('🔍 Matches API Response:', {
                    success: response.success,
                    hasData: !!response.data,
                    dataKeys: response.data ? Object.keys(response.data) : [],
                    liveType: Array.isArray(response.data?.live) ? 'array' : typeof response.data?.live,
                    liveLength: Array.isArray(response.data?.live) ? response.data.live.length : 'not array',
                    upcomingType: Array.isArray(response.data?.upcoming) ? 'array' : typeof response.data?.upcoming,
                    upcomingLength: Array.isArray(response.data?.upcoming) ? response.data.upcoming.length : 'not array',
                    fullResponse: response
                })
                
                if (response.success) {
                    // Handle different response structures
                    let liveMatches = []
                    let upcomingMatches = []
                    
                    // Extract live matches
                    if (Array.isArray(response.data?.live)) {
                        liveMatches = response.data.live
                    } else if (Array.isArray(response.data?.live?.data)) {
                        liveMatches = response.data.live.data
                    } else if (Array.isArray(response.data?.live?.matches)) {
                        liveMatches = response.data.live.matches
                    } else if (Array.isArray(response.data?.live?.results)) {
                        liveMatches = response.data.live.results
                    }
                    
                    // Extract upcoming matches
                    if (Array.isArray(response.data?.upcoming)) {
                        upcomingMatches = response.data.upcoming
                    } else if (Array.isArray(response.data?.upcoming?.data)) {
                        upcomingMatches = response.data.upcoming.data
                    } else if (Array.isArray(response.data?.upcoming?.matches)) {
                        upcomingMatches = response.data.upcoming.matches
                    } else if (Array.isArray(response.data?.upcoming?.results)) {
                        upcomingMatches = response.data.upcoming.results
                    }
                    
                    console.log('📊 Extracted Matches:', {
                        liveCount: liveMatches.length,
                        upcomingCount: upcomingMatches.length,
                        firstLiveMatch: liveMatches[0] || null,
                        firstUpcomingMatch: upcomingMatches[0] || null
                    })
                    
                    setMatches({
                        live: liveMatches,
                        upcoming: upcomingMatches,
                    })
                    
                    // Show rate limit message if present
                    if (response.message && response.rateLimit) {
                        setError(response.message)
                    }
                } else {
                    console.error('❌ API returned failure:', response)
                    setError(response.message || 'Failed to load matches')
                }
            } catch (err) {
                console.error('❌ Error loading matches:', err)
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

    // Fetch match details when a match is selected
    const handleMatchClick = async (match) => {
        setSelectedMatch(match)
        if (match.id || match.matchId) {
            try {
                setLoadingDetails(true)
                const response = await fetchMatchDetails(match.id || match.matchId)
                console.log('🔍 Frontend - Match details response:', {
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

    // If not logged in, don't render anything (redirect will happen)
    if (!user) {
        return null
    }

    const currentMatches = selectedTab === 'live' ? matches.live : matches.upcoming

    return (
        <div className='flex flex-col px-4 pb-20'>
            {/* Header */}
            <div className='pt-4 pb-2 mb-2'>
                <h2 className='text-xl font-bold text-crickbuzz-text'>Cricket Matches</h2>
            </div>

            {/* Tab Selector */}
            <div className='flex gap-2 mb-4 bg-crickbuzz-light rounded-lg p-1'>
                <button
                    onClick={() => {
                        setSelectedTab('live')
                        setSelectedMatch(null)
                        setMatchDetails(null)
                    }}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                        selectedTab === 'live'
                            ? 'bg-crickbuzz-green text-white'
                            : 'text-crickbuzz-text hover:bg-white'
                    }`}
                >
                    <span className='flex items-center justify-center gap-2'>
                        {selectedTab === 'live' && <span className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></span>}
                        Live ({matches.live.length})
                    </span>
                </button>
                <button
                    onClick={() => {
                        setSelectedTab('upcoming')
                        setSelectedMatch(null)
                        setMatchDetails(null)
                    }}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                        selectedTab === 'upcoming'
                            ? 'bg-crickbuzz-green text-white'
                            : 'text-crickbuzz-text hover:bg-white'
                    }`}
                >
                    Upcoming ({matches.upcoming.length})
                </button>
            </div>

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
                    <button
                        onClick={() => window.location.reload()}
                        className='mt-2 text-xs text-amber-700 underline hover:no-underline'
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Matches List */}
            {!loading && !error && (
                <>
                    {currentMatches.length > 0 ? (
                        <div className='space-y-2'>
                            {currentMatches.map((match, index) => (
                                <div
                                    key={match.id || match.matchId || index}
                                    onClick={() => handleMatchClick(match)}
                                    className={`cursor-pointer transition-all ${
                                        selectedMatch?.id === match.id ? 'ring-2 ring-crickbuzz-green rounded-lg' : ''
                                    }`}
                                >
                                    <CricketMatchCard 
                                        match={match} 
                                        isLive={selectedTab === 'live'} 
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='bg-crickbuzz-light rounded-lg p-4 text-center'>
                            <p className='text-xs text-crickbuzz-text-light'>
                                {selectedTab === 'live' 
                                    ? 'No live matches at the moment' 
                                    : 'No upcoming matches scheduled'}
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Match Details Modal */}
            <MatchDetailsModal
                match={selectedMatch}
                matchDetails={matchDetails}
                isOpen={!!selectedMatch}
                onClose={() => {
                    setSelectedMatch(null)
                    setMatchDetails(null)
                }}
                onOrderClick={(match) => {
                    setActiveTab('order')
                }}
                isLive={selectedTab === 'live'}
                loadingDetails={loadingDetails}
            />
        </div>
    )
}

export default Matches

