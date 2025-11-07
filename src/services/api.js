const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

/**
 * Fetch current and upcoming matches
 */
export const fetchMatches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cricket/matches`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching matches:', error)
    return { success: false, data: { live: [], upcoming: [] } }
  }
}

/**
 * Fetch current/live matches only
 */
export const fetchCurrentMatches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cricket/matches/current`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching current matches:', error)
    return { success: false, data: { data: [] } }
  }
}

/**
 * Fetch upcoming matches only
 */
export const fetchUpcomingMatches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cricket/matches/upcoming`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching upcoming matches:', error)
    return { success: false, data: { data: [] } }
  }
}

/**
 * Fetch match details by ID
 */
export const fetchMatchDetails = async (matchId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cricket/matches/${matchId}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching match details:', error)
    return { success: false, data: null }
  }
}

/**
 * Fetch series list
 */
export const fetchSeriesList = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cricket/series`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching series:', error)
    return { success: false, data: [] }
  }
}

/**
 * Auth APIs
 */
export const login = async (phone, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error logging in:', error)
    return { success: false, message: 'Failed to login' }
  }
}

export const register = async (phone, name, password, referralCode = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name, password, referralCode }),
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error registering:', error)
    return { success: false, message: 'Failed to register' }
  }
}

/**
 * Wallet APIs
 */
export const getWalletBalance = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/balance/${userId}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    return { success: false, data: { balance: 0 } }
  }
}

export const createRecharge = async (userId, amount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/recharge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount }),
    })
    const data = await response.json()
    
    // If response is not ok, return error with details
    if (!response.ok) {
      console.error('Recharge API Error:', data)
      return { 
        success: false, 
        message: data.message || 'Failed to create recharge request',
        error: data.error
      }
    }
    
    return data
  } catch (error) {
    console.error('Error creating recharge:', error)
    return { 
      success: false, 
      message: 'Network error. Please check if the backend server is running.',
      error: error.message
    }
  }
}

export const updateRechargeUTR = async (transactionId, utr) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/recharge/${transactionId}/utr`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ utr }),
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating UTR:', error)
    return { success: false, message: 'Failed to update UTR' }
  }
}

export const createWithdrawal = async (userId, amount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount }),
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating withdrawal:', error)
    return { success: false, message: 'Failed to create withdrawal request' }
  }
}

export const getUserTransactions = async (userId, status, paymentType) => {
  try {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (paymentType) params.append('paymentType', paymentType)
    
    const response = await fetch(`${API_BASE_URL}/wallet/transactions/${userId}?${params}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return { success: false, data: [] }
  }
}

/**
 * Payment Methods APIs
 */
export const getPaymentMethod = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment-methods/${userId}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching payment method:', error)
    return { success: false, message: 'Failed to fetch payment method' }
  }
}

export const savePaymentMethod = async (userId, paymentMethodData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment-methods/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentMethodData),
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error saving payment method:', error)
    return { success: false, message: 'Failed to save payment method' }
  }
}

/**
 * Earnings APIs
 */
export const getEarningsSummary = async (userId, timeRange = 'all') => {
  try {
    const params = new URLSearchParams()
    if (timeRange) params.append('timeRange', timeRange)
    
    const response = await fetch(`${API_BASE_URL}/earnings/summary/${userId}?${params}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching earnings summary:', error)
    return { success: false, message: 'Failed to fetch earnings summary' }
  }
}

export const getEarningsHistory = async (userId, timeRange = 'all', limit = 50) => {
  try {
    const params = new URLSearchParams()
    if (timeRange) params.append('timeRange', timeRange)
    if (limit) params.append('limit', limit)
    
    const response = await fetch(`${API_BASE_URL}/earnings/history/${userId}?${params}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching earnings history:', error)
    return { success: false, message: 'Failed to fetch earnings history', data: [] }
  }
}

export const createEarnings = async (userId, amount, orderId = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/earnings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount, orderId }),
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating earnings:', error)
    return { success: false, message: 'Failed to create earnings transaction' }
  }
}

export const updateEarningsStatus = async (transactionId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/earnings/${transactionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating earnings status:', error)
    return { success: false, message: 'Failed to update earnings status' }
  }
}

/**
 * Click to Earn APIs
 */
export const clickToEarn = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/earnings/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const data = await response.json()
    
    // Include status code in response for cooldown handling
    if (!response.ok) {
      return { ...data, status: response.status }
    }
    
    return data
  } catch (error) {
    console.error('Error clicking to earn:', error)
    return { success: false, message: 'Failed to process click earning' }
  }
}

export const getClickStats = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/earnings/click-stats/${userId}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching click stats:', error)
    return { success: false, message: 'Failed to fetch click stats' }
  }
}

/**
 * Referral APIs
 */
export const getReferralLink = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/referral/link/${userId}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching referral link:', error)
    return { success: false, message: 'Failed to fetch referral link' }
  }
}

export const verifyReferralCode = async (referralCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/referral/verify/${referralCode}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error verifying referral code:', error)
    return { success: false, valid: false, message: 'Failed to verify referral code' }
  }
}

export const getReferralSettings = async (adminUserId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/referral/settings?adminUserId=${adminUserId}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching referral settings:', error)
    return { success: false, message: 'Failed to fetch referral settings' }
  }
}

export const updateReferralSettings = async (adminUserId, settings) => {
  try {
    const response = await fetch(`${API_BASE_URL}/referral/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUserId, ...settings }),
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating referral settings:', error)
    return { success: false, message: 'Failed to update referral settings' }
  }
}

/**
 * Admin APIs
 */
export const deleteUser = async (userId, adminUserId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUserId }),
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, message: 'Failed to delete user' }
  }
}

export const restrictUser = async (userId, adminUserId, isRestricted) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/restrict`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUserId, isRestricted }),
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error restricting user:', error)
    return { success: false, message: 'Failed to restrict/unrestrict user' }
  }
}

export const updateUser = async (userId, adminUserId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUserId, ...userData }),
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, message: 'Failed to update user' }
  }
}

export const getPaymentMethodAdmin = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment-methods/admin/${userId}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching payment method:', error)
    return { success: false, message: 'Failed to fetch payment method' }
  }
}

