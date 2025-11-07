import { IoClose, IoCalendarOutline, IoLocationOutline, IoPeopleOutline } from 'react-icons/io5'
import { BsCircleFill } from 'react-icons/bs'
import ReactCountryFlag from 'react-country-flag'
import { useState, useEffect } from 'react'

// Helper function to extract country code from team name
const getCountryCode = (teamName) => {
  if (!teamName) return null

  const countryMap = {
    'india': 'IN',
    'pakistan': 'PK',
    'australia': 'AU',
    'england': 'GB',
    'south africa': 'ZA',
    'new zealand': 'NZ',
    'west indies': 'AG',
    'sri lanka': 'LK',
    'bangladesh': 'BD',
    'afghanistan': 'AF',
    'ireland': 'IE',
    'zimbabwe': 'ZW',
    'scotland': 'GB-SCT',
    'netherlands': 'NL',
    'nepal': 'NP',
    'oman': 'OM',
    'uae': 'AE',
    'hong kong': 'HK',
    'brazil': 'BR',
    'mexico': 'MX',
    'panama': 'PA',
    'united states': 'US',
    'canada': 'CA',
  }

  const teamLower = teamName.toLowerCase()
  for (const [key, code] of Object.entries(countryMap)) {
    if (teamLower.includes(key)) {
      return code
    }
  }

  return null
}

function MatchDetailsModal({ match, matchDetails, isOpen, onClose, isLive = false, loadingDetails = false }) {
  if (!isOpen || !match) return null

  const [maxWidth, setMaxWidth] = useState('100%')
  const [activeTab, setActiveTab] = useState('match') // 'match' (combined), 'details', 'info'

  // Get app container width for desktop constraint
  useEffect(() => {
    const updateMaxWidth = () => {
      if (typeof window !== 'undefined') {
        const appContainer = document.querySelector('.app-container')
        if (appContainer) {
          const computedStyle = window.getComputedStyle(appContainer)
          const width = computedStyle.width
          setMaxWidth(width === '420px' ? '420px' : '100%')
        } else {
          setMaxWidth('100%')
        }
      }
    }

    updateMaxWidth()
    window.addEventListener('resize', updateMaxWidth)
    return () => window.removeEventListener('resize', updateMaxWidth)
  }, [isOpen])

  // Reset active tab when modal opens - default to match tab
  useEffect(() => {
    if (isOpen) {
      setActiveTab('match')
      // Debug: Log data structure
      if (matchDetails) {
        console.log('🔍 Match Details Modal - Data Structure:', {
          matchDetails,
          matchData: matchDetails?.data?.data || matchDetails?.data || {},
          hasData: !!matchDetails?.data,
          playersCount: (matchDetails?.data?.data?.players || matchDetails?.data?.players || []).length,
          team1SquadCount: (matchDetails?.data?.data?.team1Squad || matchDetails?.data?.team1Squad || []).length,
          team2SquadCount: (matchDetails?.data?.data?.team2Squad || matchDetails?.data?.team2Squad || []).length,
        })
      }
    }
  }, [isOpen, matchDetails])

  const team1 = match.team1 || match.teams?.[0] || match.teamInfo?.[0]?.name || 'Team 1'
  const team2 = match.team2 || match.teams?.[1] || match.teamInfo?.[1]?.name || 'Team 2'
  const team1Img = match.teamInfo?.[0]?.img || null
  const team2Img = match.teamInfo?.[1]?.img || null
  const team1CountryCode = getCountryCode(team1)
  const team2CountryCode = getCountryCode(team2)

  const venue = match.venue || match.location || 'TBA'
  const date = match.date || match.dateTimeGMT || new Date().toISOString()
  const series = match.series || match.seriesName || ''
  const matchType = match.matchType || 'N/A'
  const status = match.status || 'Upcoming'

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      return date.toLocaleDateString('en-US', options)
    } catch {
      return dateString
    }
  }

  // Extract scores
  let score1 = null
  let score2 = null
  if (match.score && Array.isArray(match.score) && match.score.length > 0) {
    match.score.forEach((scoreObj, index) => {
      if (scoreObj.r !== undefined) {
        const scoreStr = `${scoreObj.r}/${scoreObj.w || 0}`
        if (index === 0) score1 = scoreStr
        else if (index === 1) score2 = scoreStr
      }
    })
  }

  // Extract squad/playing XI from matchDetails - handle nested data structure
  const matchData = matchDetails?.data?.data || matchDetails?.data || {}
  const team1Squad = matchData.team1Squad || matchData.squad?.team1 || matchData.team1 || []
  const team2Squad = matchData.team2Squad || matchData.squad?.team2 || matchData.team2 || []
  const team1PlayingXI = matchData.team1PlayingXI || matchData.playingXI?.team1 || matchData.team1Playing || []
  const team2PlayingXI = matchData.team2PlayingXI || matchData.playingXI?.team2 || matchData.team2Playing || []

  // Get organized batting data (simplified - current state only)
  const battingData = matchData.battingData || null

  // Helper functions - define before use
  const getPlayerImage = (player) => {
    if (typeof player === 'object' && player) {
      // Try multiple image field names
      return player.image || player.img || player.photo || player.avatar || player.picture || null
    }
    return null
  }

  const getPlayerName = (player) => {
    if (typeof player === 'string') return player
    return player.name || player.playerName || player.fullName || player.player || 'Unknown Player'
  }

  const getPlayerRole = (player) => {
    if (typeof player === 'object' && player) {
      return player.role || player.position || player.type || player.battingStyle || player.bowlingStyle || ''
    }
    return ''
  }

  const getPlayerInitials = (playerName) => {
    if (!playerName) return '?'
    const names = playerName.trim().split(' ')
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase()
    }
    return playerName.charAt(0).toUpperCase()
  }

  // Extract players from score data if not available in players array
  const extractPlayersFromScore = (scoreArray) => {
    const players = []
    if (!Array.isArray(scoreArray)) return players

    scoreArray.forEach((inning) => {
      // Extract batsmen
      if (inning.batsmen && Array.isArray(inning.batsmen)) {
        inning.batsmen.forEach((batsman) => {
          if (typeof batsman === 'object' && (batsman.name || batsman.playerName)) {
            players.push({
              name: batsman.name || batsman.playerName || batsman.player,
              runs: batsman.r,
              balls: batsman.b,
              fours: batsman['4s'],
              sixes: batsman['6s'],
              strikeRate: batsman.sr,
              role: batsman.role || 'Batsman',
              image: batsman.image || batsman.img || batsman.photo || null,
            })
          }
        })
      }

      // Extract bowlers
      if (inning.bowlers && Array.isArray(inning.bowlers)) {
        inning.bowlers.forEach((bowler) => {
          if (typeof bowler === 'object' && (bowler.name || bowler.playerName)) {
            players.push({
              name: bowler.name || bowler.playerName || bowler.player,
              overs: bowler.o,
              runs: bowler.r,
              wickets: bowler.w,
              maidens: bowler.m,
              economy: bowler.econ,
              role: bowler.role || 'Bowler',
              image: bowler.image || bowler.img || bowler.photo || null,
            })
          }
        })
      }
    })

    return players
  }

  // Get players from multiple sources
  const playersFromData = matchData.players || []
  const playersFromScore = extractPlayersFromScore(match.score || [])

  // Merge players, avoiding duplicates
  const allPlayersMap = new Map()

  // Add players from data first
  playersFromData.forEach((player) => {
    const playerName = getPlayerName(player)
    if (playerName && playerName !== 'Unknown Player') {
      allPlayersMap.set(playerName.toLowerCase(), {
        name: playerName,
        runs: player.runs || player.r,
        wickets: player.wickets || player.w,
        role: getPlayerRole(player) || player.role,
        image: getPlayerImage(player),
        ...player,
      })
    }
  })

  // Add players from score
  playersFromScore.forEach((player) => {
    const playerName = player.name
    if (playerName) {
      const key = playerName.toLowerCase()
      if (!allPlayersMap.has(key)) {
        allPlayersMap.set(key, player)
      } else {
        // Merge data
        const existing = allPlayersMap.get(key)
        allPlayersMap.set(key, { ...existing, ...player })
      }
    }
  })

  const allPlayers = Array.from(allPlayersMap.values())

  // Sort top performers by runs (descending), then by wickets
  const sortedTopPerformers = [...allPlayers].sort((a, b) => {
    const runsA = a.runs || 0
    const runsB = b.runs || 0
    if (runsB !== runsA) return runsB - runsA
    const wicketsA = a.wickets || 0
    const wicketsB = b.wickets || 0
    return wicketsB - wicketsA
  })

  // Get bench players (squad minus playing XI)
  const getBenchPlayers = (squad, playingXI) => {
    if (!Array.isArray(squad) || !Array.isArray(playingXI)) return []
    const playingNames = playingXI.map(p => typeof p === 'string' ? p.toLowerCase() : (p.name || '').toLowerCase())
    return squad.filter(p => {
      const playerName = typeof p === 'string' ? p.toLowerCase() : (p.name || '').toLowerCase()
      return !playingNames.includes(playerName)
    })
  }

  const team1Bench = getBenchPlayers(team1Squad, team1PlayingXI)
  const team2Bench = getBenchPlayers(team2Squad, team2PlayingXI)

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col justify-end overflow-hidden'
      style={{
        left: maxWidth === '420px' ? '50%' : '0',
        right: maxWidth === '420px' ? 'auto' : '0',
        width: maxWidth,
        maxWidth: maxWidth,
        transform: maxWidth === '420px' ? 'translateX(-50%)' : 'none',
        marginLeft: maxWidth === '420px' ? '0' : 'auto',
        marginRight: maxWidth === '420px' ? '0' : 'auto'
      }}
      onClick={onClose}
    >
      <div
        className='bg-white rounded-t-2xl overflow-y-auto shadow-xl mt-12'
        style={{
          width: '100%',
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 3rem - 3.5rem)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm'>
          {/* Top Row: Teams + Live indicator + Close */}
          <div className='p-3 flex items-center justify-between'>
            <div className='flex items-center gap-2 flex-1 min-w-0'>
              {/* Team 1 Flag + Name */}
              <div className='flex items-center gap-1.5 flex-shrink-0'>
                {team1Img ? (
                  <img
                    src={team1Img}
                    alt={team1}
                    className='w-8 h-8 rounded-full object-cover border border-gray-200'
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : team1CountryCode ? (
                  <ReactCountryFlag
                    countryCode={team1CountryCode}
                    svg
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                    title={team1}
                  />
                ) : (
                  <div className='w-8 h-8 rounded-full bg-crickbuzz-green border border-gray-200'></div>
                )}
                <span className='text-xs font-semibold text-gray-800 truncate max-w-[70px]'>{team1}</span>
              </div>

              {/* VS */}
              <span className='text-xs text-gray-400 font-semibold flex-shrink-0 px-1'>VS</span>

              {/* Team 2 Flag + Name */}
              <div className='flex items-center gap-1.5 flex-shrink-0'>
                {team2Img ? (
                  <img
                    src={team2Img}
                    alt={team2}
                    className='w-8 h-8 rounded-full object-cover border border-gray-200'
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : team2CountryCode ? (
                  <ReactCountryFlag
                    countryCode={team2CountryCode}
                    svg
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                    title={team2}
                  />
                ) : (
                  <div className='w-8 h-8 rounded-full bg-blue-500 border border-gray-200'></div>
                )}
                <span className='text-xs font-semibold text-gray-800 truncate max-w-[70px]'>{team2}</span>
              </div>


            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className='text-gray-500 hover:text-gray-700 text-xl leading-none p-1 flex-shrink-0'
            >
              <IoClose />
            </button>
          </div>

          {/* Second Row: LIVE Badge + Match Status */}
          <div className='px-3 pb-3 flex items-center gap-2'>
            {isLive && (
              <span className='flex items-center gap-1 text-red-600 font-bold text-xs'>
                <BsCircleFill className='text-[8px] animate-pulse' />
                LIVE
              </span>
            )}
            <span className='text-xs text-gray-700 font-medium'>{status}</span>
          </div>
        </div>

        {/* Content */}
        <div className='p-3'>
          {loadingDetails ? (
            <div className='text-center py-8'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-crickbuzz-green mb-2'></div>
              <p className='text-sm text-crickbuzz-text-light'>Loading match details...</p>
            </div>
          ) : (
            <>
              {/* Series Name */}
              {series && (
                <div className='text-xs text-gray-500 font-medium uppercase tracking-wide mb-3'>
                  {series}
                </div>
              )}

              {/* Tabs - Match, Squad, Details, Info */}
              <div className='flex gap-2 mb-3 border-b border-gray-200 overflow-x-auto scrollbar-hide'>
                <button
                  onClick={() => setActiveTab('match')}
                  className={`px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${activeTab === 'match'
                      ? 'text-crickbuzz-green border-b-2 border-crickbuzz-green'
                      : 'text-gray-600 hover:text-crickbuzz-text'
                    }`}
                >
                  Match
                </button>
                <button
                  onClick={() => setActiveTab('squad')}
                  className={`px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${activeTab === 'squad'
                      ? 'text-crickbuzz-green border-b-2 border-crickbuzz-green'
                      : 'text-gray-600 hover:text-crickbuzz-text'
                    }`}
                >
                  Squad
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${activeTab === 'details'
                      ? 'text-crickbuzz-green border-b-2 border-crickbuzz-green'
                      : 'text-gray-600 hover:text-crickbuzz-text'
                    }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${activeTab === 'info'
                      ? 'text-crickbuzz-green border-b-2 border-crickbuzz-green'
                      : 'text-gray-600 hover:text-crickbuzz-text'
                    }`}
                >
                  Info
                </button>
              </div>

              {/* Tab Content */}
              <div className='space-y-3'>
                {/* Match Tab - Combined Score, Squad, and Performers */}
                {activeTab === 'match' && (
                  <div className='space-y-4'>
                    {/* Current Match State - Simplified */}
                    {battingData ? (
                      <div className='space-y-3'>
                        {/* Batting Team */}
                        <div className='bg-green-50 rounded-lg p-3 border border-green-200'>
                          <div className='flex items-center justify-between mb-2'>
                            <div className='font-bold text-sm text-gray-900'>{battingData.battingTeam}</div>
                            <div className='text-xs text-gray-700'>
                              <span className='font-bold text-green-700'>{battingData.totalRuns}</span>
                              <span className='text-gray-600'>/{battingData.totalWickets}</span>
                              {battingData.totalOvers > 0 && (
                                <span className='text-gray-500 ml-1'>({battingData.totalOvers} ov)</span>
                              )}
                            </div>
                          </div>

                          {/* Current Batsmen */}
                          {battingData.currentBatsmen && battingData.currentBatsmen.length > 0 && (
                            <div className='space-y-1.5 mb-2'>
                              {battingData.currentBatsmen.map((batsman, idx) => (
                                <div key={idx} className='flex items-center justify-between text-xs'>
                                  <div className='flex items-center gap-2 flex-1'>
                                    <div className='w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white text-[9px] font-bold'>
                                      {getPlayerInitials(batsman.name)}
                                    </div>
                                    <span className='font-medium text-gray-800'>{batsman.name}</span>
                                  </div>
                                  <span className='text-gray-700'>
                                    <span className='font-bold'>{batsman.runs}</span>
                                    {battingData.totalOvers > 0 && batsman.balls > 0 && (
                                      <span className='text-gray-500'>({batsman.balls})</span>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Next Batsman */}
                          {battingData.nextBatsman && (
                            <div className='pt-2 border-t border-green-200'>
                              <div className='text-[10px] text-gray-600 mb-1'>Next:</div>
                              <div className='flex items-center gap-2 text-xs text-gray-700'>
                                <div className='w-4 h-4 rounded-full bg-blue-400 flex items-center justify-center text-white text-[8px] font-bold'>
                                  {getPlayerInitials(battingData.nextBatsman.name)}
                                </div>
                                <span>{battingData.nextBatsman.name}</span>
                              </div>
                            </div>
                          )}

                          {/* Dismissed (last 3 only) */}
                          {battingData.dismissedBatsmen && battingData.dismissedBatsmen.length > 0 && (
                            <div className='pt-2 border-t border-green-200 mt-2'>
                              <div className='text-[10px] text-gray-600 mb-1'>Out:</div>
                              <div className='space-y-1'>
                                {battingData.dismissedBatsmen.slice(0, 3).map((batsman, idx) => (
                                  <div key={idx} className='flex items-center justify-between text-[10px] text-gray-600'>
                                    <span className='truncate flex-1'>{batsman.name}</span>
                                    <span className='ml-2'>{batsman.runs}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Bowling Team */}
                        {battingData.bowlingTeam && (
                          <div className='bg-blue-50 rounded-lg p-3 border border-blue-200'>
                            <div className='font-bold text-sm text-gray-900 mb-2'>{battingData.bowlingTeam}</div>
                            {battingData.currentBowlers && battingData.currentBowlers.length > 0 && (
                              <div className='space-y-1'>
                                {battingData.currentBowlers.map((bowler, idx) => (
                                  <div key={idx} className='flex items-center justify-between text-xs'>
                                    <div className='flex items-center gap-2 flex-1'>
                                      <div className='w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold'>
                                        {getPlayerInitials(bowler.name)}
                                      </div>
                                      <span className='font-medium text-gray-800'>{bowler.name}</span>
                                    </div>
                                    <span className='text-gray-700'>
                                      {bowler.overs > 0 && `${bowler.overs} ov`}
                                      {bowler.wickets > 0 && ` • ${bowler.wickets} wkts`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : match.score && Array.isArray(match.score) && match.score.length > 0 ? (
                      // Fallback to simple score display
                      <div className='space-y-2'>
                        {match.score.map((scoreObj, idx) => (
                          <div key={idx} className='bg-gray-50 rounded-lg p-2 text-xs'>
                            <span className='font-semibold'>{scoreObj.inning || `Inning ${idx + 1}`}</span>
                            <span className='ml-2 text-gray-700'>
                              {scoreObj.r !== undefined && <span className='font-bold'>{scoreObj.r}</span>}
                              {scoreObj.w !== undefined && <span className='text-gray-600'>/{scoreObj.w}</span>}
                              {scoreObj.o !== undefined && <span className='text-gray-500 ml-1'>({scoreObj.o} ov)</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='bg-gray-50 rounded-lg p-3 text-center'>
                        <p className='text-xs text-gray-500'>Match details not available</p>
                      </div>
                    )}

                    {/* Top Performers Section */}
                    <div>
                      <h4 className='text-sm font-bold text-gray-900 mb-3'>Top Performers</h4>
                      {sortedTopPerformers.length > 0 ? (
                        <div className='space-y-2'>
                          {sortedTopPerformers.slice(0, 6).map((player, idx) => {
                            const playerName = getPlayerName(player)
                            const playerImage = getPlayerImage(player)
                            const playerRole = getPlayerRole(player)
                            return (
                              <div key={idx} className='flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200'>
                                {playerImage ? (
                                  <img 
                                    src={playerImage} 
                                    alt={playerName}
                                    className='w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-200'
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                      e.target.nextSibling.style.display = 'flex'
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className={`w-8 h-8 rounded-full bg-crickbuzz-green flex items-center justify-center text-white text-xs font-bold flex-shrink-0 border border-gray-200 ${playerImage ? 'hidden' : ''}`}
                                  style={{ display: playerImage ? 'none' : 'flex' }}
                                >
                                  {getPlayerInitials(playerName)}
                                </div>
                                <div className='flex-1 min-w-0'>
                                  <div className='text-xs font-semibold text-gray-800 truncate'>{playerName}</div>
                                  <div className='flex items-center gap-2 mt-0.5'>
                                    {playerRole && (
                                      <span className='text-[10px] text-gray-500'>{playerRole}</span>
                                    )}
                                    {(player.runs !== undefined || player.wickets !== undefined) && (
                                      <span className='text-[10px] text-gray-400'>•</span>
                                    )}
                                    {player.runs !== undefined && player.runs > 0 && (
                                      <span className='text-[10px] font-semibold text-gray-700'>{player.runs} runs</span>
                                    )}
                                    {player.wickets !== undefined && player.wickets > 0 && (
                                      <span className='text-[10px] font-semibold text-gray-700'>{player.wickets} wkts</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className='bg-gray-50 rounded-lg p-3 text-center'>
                          <p className='text-xs text-gray-500'>Player statistics not available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Squad Tab */}
                {activeTab === 'squad' && (
                  <div className='space-y-4'>
                    {/* Squad Section */}
                    <div>
                      <h4 className='text-sm font-bold text-gray-900 mb-3'>Playing XI / Squad</h4>
                      {(team1PlayingXI.length > 0 || team2PlayingXI.length > 0 || team1Squad.length > 0 || team2Squad.length > 0) ? (
                        <div className='space-y-4'>
                          {/* Team 1 Playing XI */}
                          {(team1PlayingXI.length > 0 || team1Squad.length > 0) && (
                            <div className='bg-gray-50 rounded-lg p-3'>
                              <h5 className='text-xs font-semibold text-gray-900 mb-3'>
                                {team1} - {team1PlayingXI.length > 0 ? 'Playing XI' : 'Squad'}
                              </h5>
                              <div className='space-y-2'>
                                {(team1PlayingXI.length > 0 ? team1PlayingXI : team1Squad.slice(0, 11)).map((player, idx) => {
                                  const playerName = getPlayerName(player)
                                  const playerImage = getPlayerImage(player)
                                  const playerRole = getPlayerRole(player)
                                  return (
                                    <div key={idx} className='flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200'>
                                          {playerImage ? (
                                            <img
                                              src={playerImage}
                                              alt={playerName}
                                              className='w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-200'
                                              onError={(e) => {
                                                e.target.style.display = 'none'
                                                e.target.nextSibling.style.display = 'flex'
                                              }}
                                            />
                                          ) : null}
                                          <div
                                            className={`w-8 h-8 rounded-full bg-crickbuzz-green flex items-center justify-center text-white text-xs font-bold flex-shrink-0 border border-gray-200 ${playerImage ? 'hidden' : ''}`}
                                            style={{ display: playerImage ? 'none' : 'flex' }}
                                          >
                                            {getPlayerInitials(playerName)}
                                          </div>
                                          <div className='flex-1 min-w-0'>
                                            <div className='text-xs font-semibold text-gray-800 truncate'>{playerName}</div>
                                            {playerRole && (
                                              <div className='text-[10px] text-gray-500 mt-0.5'>{playerRole}</div>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Team 2 Playing XI */}
                              {(team2PlayingXI.length > 0 || team2Squad.length > 0) && (
                                <div className='bg-gray-50 rounded-lg p-3'>
                                  <h5 className='text-xs font-semibold text-gray-900 mb-3'>
                                    {team2} - {team2PlayingXI.length > 0 ? 'Playing XI' : 'Squad'}
                                  </h5>
                                  <div className='space-y-2'>
                                    {(team2PlayingXI.length > 0 ? team2PlayingXI : team2Squad.slice(0, 11)).map((player, idx) => {
                                      const playerName = getPlayerName(player)
                                      const playerImage = getPlayerImage(player)
                                      const playerRole = getPlayerRole(player)
                                      return (
                                        <div key={idx} className='flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200'>
                                          {playerImage ? (
                                            <img
                                              src={playerImage}
                                              alt={playerName}
                                              className='w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-200'
                                              onError={(e) => {
                                                e.target.style.display = 'none'
                                                e.target.nextSibling.style.display = 'flex'
                                              }}
                                            />
                                          ) : null}
                                          <div
                                            className={`w-8 h-8 rounded-full bg-crickbuzz-green flex items-center justify-center text-white text-xs font-bold flex-shrink-0 border border-gray-200 ${playerImage ? 'hidden' : ''}`}
                                            style={{ display: playerImage ? 'none' : 'flex' }}
                                          >
                                            {getPlayerInitials(playerName)}
                                          </div>
                                          <div className='flex-1 min-w-0'>
                                            <div className='text-xs font-semibold text-gray-800 truncate'>{playerName}</div>
                                            {playerRole && (
                                              <div className='text-[10px] text-gray-500 mt-0.5'>{playerRole}</div>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className='bg-gray-50 rounded-lg p-3 text-center'>
                              <p className='text-xs text-gray-500'>Squad information not available</p>
                            </div>
                          )}

                          {/* Bench Players */}
                          {(team1Bench.length > 0 || team2Bench.length > 0) && (
                            <div className='mt-4'>
                              <h4 className='text-sm font-bold text-crickbuzz-text mb-3 flex items-center gap-2'>
                                <IoPeopleOutline className='text-gray-500' />
                                <span className='w-1 h-4 bg-gray-400 rounded'></span>
                                Bench Players / Substitutes
                              </h4>

                              <div className='space-y-3'>
                                {/* Team 1 Bench */}
                                {team1Bench.length > 0 && (
                                  <div className='bg-gray-50 rounded-lg p-2.5 opacity-90'>
                                    <h5 className='text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2'>
                                      <span className='w-2 h-2 rounded-full bg-crickbuzz-green opacity-50'></span>
                                      {team1} - Bench
                                    </h5>
                                    <div className='space-y-1'>
                                      {team1Bench.map((player, idx) => {
                                        const playerName = getPlayerName(player)
                                        const playerImage = getPlayerImage(player)
                                        const playerRole = getPlayerRole(player)
                                        return (
                                          <div key={idx} className='flex items-center gap-2 bg-white rounded-lg p-1.5 border border-gray-100'>
                                            {playerImage ? (
                                              <img
                                                src={playerImage}
                                                alt={playerName}
                                                className='w-7 h-7 rounded-full object-cover flex-shrink-0 border border-gray-200'
                                                onError={(e) => {
                                                  e.target.style.display = 'none'
                                                  e.target.nextSibling.style.display = 'flex'
                                                }}
                                              />
                                            ) : null}
                                            <div
                                              className={`w-7 h-7 rounded-full bg-crickbuzz-green/60 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 border border-gray-200 ${playerImage ? 'hidden' : ''}`}
                                              style={{ display: playerImage ? 'none' : 'flex' }}
                                            >
                                              {getPlayerInitials(playerName)}
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                              <div className='text-xs text-gray-600 truncate'>{playerName}</div>
                                              {playerRole && (
                                                <div className='text-[10px] text-gray-400'>{playerRole}</div>
                                              )}
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Team 2 Bench */}
                                {team2Bench.length > 0 && (
                                  <div className='bg-gray-50 rounded-lg p-2.5 opacity-90'>
                                    <h5 className='text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2'>
                                      <span className='w-2 h-2 rounded-full bg-blue-500 opacity-50'></span>
                                      {team2} - Bench
                                    </h5>
                                    <div className='space-y-1'>
                                      {team2Bench.map((player, idx) => {
                                        const playerName = getPlayerName(player)
                                        const playerImage = getPlayerImage(player)
                                        const playerRole = getPlayerRole(player)
                                        return (
                                          <div key={idx} className='flex items-center gap-2 bg-white rounded-lg p-1.5 border border-gray-100'>
                                            {playerImage ? (
                                              <img
                                                src={playerImage}
                                                alt={playerName}
                                                className='w-7 h-7 rounded-full object-cover flex-shrink-0 border border-gray-200'
                                                onError={(e) => {
                                                  e.target.style.display = 'none'
                                                  e.target.nextSibling.style.display = 'flex'
                                                }}
                                              />
                                            ) : null}
                                            <div
                                              className={`w-7 h-7 rounded-full bg-blue-500/60 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 border border-gray-200 ${playerImage ? 'hidden' : ''}`}
                                              style={{ display: playerImage ? 'none' : 'flex' }}
                                            >
                                              {getPlayerInitials(playerName)}
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                              <div className='text-xs text-gray-600 truncate'>{playerName}</div>
                                              {playerRole && (
                                                <div className='text-[10px] text-gray-400'>{playerRole}</div>
                                              )}
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Details Tab */}
                    {activeTab === 'details' && (
                      <div className='bg-gray-50 rounded-lg p-3 space-y-2'>
                        {matchData.tossWinner ? (
                          <div className='flex items-center justify-between'>
                            <span className='text-xs text-gray-600 font-medium'>Toss Winner:</span>
                            <span className='text-xs text-gray-800 font-semibold capitalize'>{matchData.tossWinner}</span>
                          </div>
                        ) : (
                          <div className='text-xs text-gray-500 text-center py-2'>Toss information not available</div>
                        )}
                        {matchData.tossChoice && (
                          <div className='flex items-center justify-between'>
                            <span className='text-xs text-gray-600 font-medium'>Toss Choice:</span>
                            <span className='text-xs text-gray-800 font-semibold capitalize'>{matchData.tossChoice}</span>
                          </div>
                        )}
                        {matchData.matchWinner && (
                          <div className='flex items-center justify-between pt-2 border-t border-gray-200'>
                            <span className='text-xs text-gray-600 font-medium'>Match Winner:</span>
                            <span className='text-xs font-bold text-crickbuzz-green capitalize'>{matchData.matchWinner}</span>
                          </div>
                        )}
                        {matchData.matchReport && (
                          <div className='pt-2 border-t border-gray-200'>
                            <p className='text-xs text-gray-700 leading-relaxed'>{matchData.matchReport}</p>
                          </div>
                        )}
                        {matchData.hasSquad !== undefined && (
                          <div className='pt-2 border-t border-gray-200'>
                            <p className={`text-[10px] ${matchData.hasSquad ? 'text-green-600' : 'text-amber-600'} font-medium`}>
                              {matchData.hasSquad ? '✓ Squad information available' : '⚠ Squad information not available'}
                            </p>
                          </div>
                        )}
                        {!matchData.tossWinner && !matchData.matchWinner && !matchData.matchReport && (
                          <div className='text-xs text-gray-500 text-center py-4'>
                            Match details not available yet
                          </div>
                        )}
                      </div>
                    )}

                    {/* Info Tab */}
                    {activeTab === 'info' && (
                      <div className='space-y-3'>
                        {/* Match Info */}
                        <div className='bg-gray-50 rounded-lg p-3 space-y-2'>
                          <div className='flex items-center gap-2 text-xs text-gray-700'>
                            <IoCalendarOutline className='text-crickbuzz-green flex-shrink-0 text-sm' />
                            <span className='truncate font-medium'>{formatDate(date)}</span>
                          </div>
                          <div className='flex items-center gap-2 text-xs text-gray-700'>
                            <IoLocationOutline className='text-crickbuzz-green flex-shrink-0 text-sm' />
                            <span className='truncate font-medium'>{venue}</span>
                          </div>
                          <div className='flex items-center justify-between pt-1 border-t border-gray-200'>
                            <span className='text-xs text-gray-600 font-semibold'>Match Type:</span>
                            <span className='text-xs text-gray-800 font-bold uppercase'>{matchType}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
            </>
          )}
            </div>

          {/* Footer Actions */}
          <div className='sticky bottom-0 bg-white border-t border-gray-200 p-3 pb-16 flex gap-2 shadow-lg'>
            <button
              onClick={onClose}
              className='flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors text-xs font-semibold'
            >
              Close
            </button>
          </div>
        </div>
      </div>
      )
}

      export default MatchDetailsModal

