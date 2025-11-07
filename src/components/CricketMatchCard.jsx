import { IoCalendarOutline, IoLocationOutline } from 'react-icons/io5'
import { BsCircleFill } from 'react-icons/bs'
import ReactCountryFlag from 'react-country-flag'

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

function CricketMatchCard({ match, isLive = false }) {
  // Debug logging
  if (!match) {
    console.warn('⚠️ CricketMatchCard received null/undefined match')
    return null
  }
  
  // Format team names (handle different API response formats)
  const team1 = match.team1 || match.teams?.[0] || match.teamInfo?.[0]?.name || 'Team 1'
  const team2 = match.team2 || match.teams?.[1] || match.teamInfo?.[1]?.name || 'Team 2'
  
  // Log match data for debugging
  console.log('🎴 CricketMatchCard rendering:', {
    matchId: match.id || match.matchId,
    team1,
    team2,
    hasScore: !!match.score,
    scoreArray: match.score,
    matchStarted: match.matchStarted,
    matchEnded: match.matchEnded,
    status: match.status
  })
  
  // Get team images/flags
  const team1Img = match.teamInfo?.[0]?.img || null
  const team2Img = match.teamInfo?.[1]?.img || null
  const team1CountryCode = getCountryCode(team1)
  const team2CountryCode = getCountryCode(team2)
  
  // Extract scores from various API response formats
  let score1 = null
  let score2 = null
  
  // Helper to normalize team names for matching
  const normalizeTeamName = (name) => {
    if (!name) return ''
    return name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
  }
  
  const team1Normalized = normalizeTeamName(team1)
  const team2Normalized = normalizeTeamName(team2)
  const teamsArray = match.teams || []
  const team1FromArray = teamsArray[0] ? normalizeTeamName(teamsArray[0]) : ''
  const team2FromArray = teamsArray[1] ? normalizeTeamName(teamsArray[1]) : ''
  
  // Handle cricapi.com score format: score array with { r: runs, w: wickets, o: overs, inning: "..." }
  if (match.score && Array.isArray(match.score) && match.score.length > 0) {
    // Match scores to teams based on inning name or order
    match.score.forEach((scoreObj, index) => {
      if (scoreObj.r !== undefined || scoreObj.runs !== undefined) {
        const runs = scoreObj.r !== undefined ? scoreObj.r : scoreObj.runs
        const wickets = scoreObj.w !== undefined ? scoreObj.w : (scoreObj.wickets || 0)
        const scoreStr = `${runs}/${wickets}`
        
        // Try to match by inning name
        if (scoreObj.inning) {
          const inningLower = normalizeTeamName(scoreObj.inning)
          // Check if inning contains team name
          if (inningLower.includes(team1Normalized) || 
              (team1FromArray && inningLower.includes(team1FromArray)) ||
              inningLower.includes(team1.split(' ')[0]?.toLowerCase() || '')) {
            score1 = scoreStr
          } else if (inningLower.includes(team2Normalized) || 
                     (team2FromArray && inningLower.includes(team2FromArray)) ||
                     inningLower.includes(team2.split(' ')[0]?.toLowerCase() || '')) {
            score2 = scoreStr
          } else {
            // Fallback to order if no match found
            if (index === 0 && !score1) score1 = scoreStr
            else if (index === 1 && !score2) score2 = scoreStr
            else if (index === 0 && score1) score2 = scoreStr // If first score already assigned, second goes to team2
            else if (index === 1 && score2) score1 = scoreStr // If second score already assigned, first goes to team1
          }
        } else {
          // No inning info, use order
          if (index === 0) score1 = scoreStr
          else if (index === 1) score2 = scoreStr
        }
      }
    })
  }
  
  // Try other score formats as fallback
  if (!score1 && match.score1) {
    score1 = match.score1
  }
  if (!score2 && match.score2) {
    score2 = match.score2
  }
  if ((!score1 || !score2) && match.scores && Array.isArray(match.scores)) {
    if (!score1) score1 = match.scores[0]
    if (!score2) score2 = match.scores[1]
  }
  
  // Try to extract from score string format
  if (!score1 && !score2 && match.score && typeof match.score === 'string') {
    const scores = match.score.split(' vs ').map(s => s.trim())
    if (scores.length >= 2) {
      score1 = scores[0]
      score2 = scores[1]
    }
  }
  
  // Format score display
  const formatScore = (score) => {
    if (!score) return null
    if (typeof score === 'string') {
      // If it's already formatted, return as is
      if (score.includes('/')) return score
      return score
    }
    if (typeof score === 'object' && score.r !== undefined) {
      return `${score.r}/${score.w || 0}`
    }
    if (typeof score === 'object' && score.runs !== undefined) {
      return `${score.runs}/${score.wickets || 0}`
    }
    return String(score)
  }
  
  score1 = formatScore(score1)
  score2 = formatScore(score2)
  
  const status = match.status || match.matchStatus || match.matchStatusText || 'Upcoming'
  const venue = match.venue || match.location || match.venueInfo?.name || 'TBA'
  const date = match.date || match.matchDate || match.startDate || match.dateTimeGMT || new Date().toISOString()
  const series = match.series || match.tournament || match.seriesName || match.seriesInfo?.name || ''

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
      return date.toLocaleDateString('en-US', options)
    } catch {
      return dateString
    }
  }

  // Format match status
  const getStatusDisplay = () => {
    if (isLive || status?.toLowerCase().includes('live')) {
      return (
        <span className='flex items-center gap-1 text-red-600 font-bold text-xs'>
          <BsCircleFill className='text-[8px] animate-pulse' />
          LIVE
        </span>
      )
    }
    if (status?.toLowerCase().includes('completed')) {
      return <span className='text-gray-500 text-xs font-semibold'>COMPLETED</span>
    }
    return <span className='text-crickbuzz-green text-xs font-semibold'>UPCOMING</span>
  }

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow h-full flex flex-col'>
      {/* Series Name */}
      {series && (
        <div className='text-xs text-gray-500 mb-2 font-medium'>{series}</div>
      )}

      {/* Teams and Score */}
      <div className='space-y-2.5 mb-3 flex-1'>
        {/* Team 1 */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5 flex-1 min-w-0'>
            {team1Img ? (
              <img 
                src={team1Img} 
                alt={team1} 
                className='w-6 h-6 rounded-full object-cover flex-shrink-0'
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            ) : team1CountryCode ? (
              <ReactCountryFlag
                countryCode={team1CountryCode}
                svg
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                }}
                title={team1}
              />
            ) : (
              <div className='w-6 h-6 rounded-full bg-crickbuzz-green flex-shrink-0'></div>
            )}
            <span className='text-sm font-semibold text-gray-800 truncate'>{team1}</span>
          </div>
          {score1 ? (
            <div className='text-right flex-shrink-0 ml-2'>
              <span className='text-sm font-bold text-gray-900'>{score1}</span>
              {(() => {
                // Find the correct score object for team1
                const team1ScoreObj = match.score?.find((s, idx) => {
                  if (s.inning) {
                    const inningLower = normalizeTeamName(s.inning)
                    return inningLower.includes(team1Normalized) || 
                           (team1FromArray && inningLower.includes(team1FromArray))
                  }
                  return idx === 0
                }) || match.score?.[0]
                return team1ScoreObj?.o ? (
                  <span className='text-xs text-gray-500 ml-1'>({team1ScoreObj.o} ov)</span>
                ) : null
              })()}
            </div>
          ) : (isLive || match.matchStarted) && (
            <span className='text-xs text-gray-400 italic flex-shrink-0 ml-2'>Yet to bat</span>
          )}
        </div>

        {/* Team 2 */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5 flex-1 min-w-0'>
            {team2Img ? (
              <img 
                src={team2Img} 
                alt={team2} 
                className='w-6 h-6 rounded-full object-cover flex-shrink-0'
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            ) : team2CountryCode ? (
              <ReactCountryFlag
                countryCode={team2CountryCode}
                svg
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                }}
                title={team2}
              />
            ) : (
              <div className='w-6 h-6 rounded-full bg-blue-500 flex-shrink-0'></div>
            )}
            <span className='text-sm font-semibold text-gray-800 truncate'>{team2}</span>
          </div>
          {score2 ? (
            <div className='text-right flex-shrink-0 ml-2'>
              <span className='text-sm font-bold text-gray-900'>{score2}</span>
              {(() => {
                // Find the correct score object for team2
                const team2ScoreObj = match.score?.find((s, idx) => {
                  if (s.inning) {
                    const inningLower = normalizeTeamName(s.inning)
                    return inningLower.includes(team2Normalized) || 
                           (team2FromArray && inningLower.includes(team2FromArray))
                  }
                  return idx === 1
                }) || match.score?.[1]
                return team2ScoreObj?.o ? (
                  <span className='text-xs text-gray-500 ml-1'>({team2ScoreObj.o} ov)</span>
                ) : null
              })()}
            </div>
          ) : (isLive || match.matchStarted) && (
            <span className='text-xs text-gray-400 italic flex-shrink-0 ml-2'>Yet to bat</span>
          )}
        </div>
      </div>

      {/* Match Info - Show current over/ball info for live matches */}
      {isLive && (match.currentOver || match.ballNumber || match.matchInfo) && (
        <div className='bg-red-50 border border-red-200 rounded px-2 py-1 mb-2'>
          <p className='text-xs text-red-700 font-medium'>
            {match.currentOver ? `Over ${match.currentOver}` : ''}
            {match.ballNumber ? ` Ball ${match.ballNumber}` : ''}
            {match.matchInfo ? ` - ${match.matchInfo}` : ''}
            {match.recentOvers && match.recentOvers.length > 0 && (
              <span className='ml-2'>Recent: {match.recentOvers.slice(-3).join(', ')}</span>
            )}
          </p>
        </div>
      )}

      {/* Status and Info */}
      <div className='flex items-center justify-between pt-2 border-t border-gray-100'>
        <div className='flex items-center gap-3 text-xs text-gray-500'>
          <div className='flex items-center gap-1'>
            <IoCalendarOutline className='text-xs' />
            <span>{formatDate(date)}</span>
          </div>
          <div className='flex items-center gap-1'>
            <IoLocationOutline className='text-xs' />
            <span className='truncate max-w-[100px]'>{venue}</span>
          </div>
        </div>
        {getStatusDisplay()}
      </div>
    </div>
  )
}

export default CricketMatchCard

