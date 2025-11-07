import { useState, useEffect } from 'react'
import './App.css'
import { APP_CONFIG } from './config'
import TabBar from './components/TabBar'
import Home from './components/pages/Home'
import Matches from './components/pages/Matches'
import Earnings from './components/pages/Earnings'
import Recharge from './components/pages/Recharge'
import Withdrawal from './components/pages/Withdrawal'
import Account from './components/pages/Account'
import Payment from './components/pages/Payment'
import PaymentMethods from './components/pages/PaymentMethods'
import MyOrders from './components/pages/MyOrders'
import ReferAndEarn from './components/pages/ReferAndEarn'
import AdminDashboard from './components/pages/admin/Dashboard'
import AdminWithdrawals from './components/pages/admin/Withdrawals'
import AdminPayments from './components/pages/admin/Payments'
import AdminUsers from './components/pages/admin/Users'
import AdminReferralSettings from './components/pages/admin/ReferralSettings'
import AdminLossTracking from './components/pages/admin/LossTracking'
import { getWalletBalance } from './services/api'
import Alert from './components/Alert'

function App() {
  const [activeTab, setActiveTab] = useState('account') // Default to login page
  const [user, setUser] = useState(null) // User authentication state
  const [walletBalance, setWalletBalance] = useState(0)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [paymentData, setPaymentData] = useState(null) // Store payment data for payment page
  const [alert, setAlert] = useState({ isOpen: false, type: 'info', message: '' })

  // Fetch wallet balance from backend
  const fetchWalletBalance = async (userId) => {
    if (!userId) return
    try {
      setLoadingBalance(true)
      const response = await getWalletBalance(userId)
      if (response.success) {
        setWalletBalance(response.data.balance || 0)
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    } finally {
      setLoadingBalance(false)
    }
  }

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message })
  }

  const handleLogin = async (userData) => {
    // Check if user is restricted (should be caught by backend, but double-check)
    if (userData.isRestricted && !userData.isAdmin) {
      showAlert('error', 'Your account has been restricted. Please contact support.')
      setActiveTab('account')
      return
    }
    
    setUser(userData)
    // Save user to localStorage
    localStorage.setItem('user', JSON.stringify(userData))
    // Set default tab based on user role
    if (userData.isAdmin) {
      setActiveTab('admin-dashboard')
    } else {
      setActiveTab('home')
    }
    // Fetch wallet balance from backend (only for regular users)
    if (!userData.isAdmin) {
      await fetchWalletBalance(userData.phone)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    setWalletBalance(0)
    setActiveTab('account') // Go to login page after logout
  }


  const refreshWalletBalance = async () => {
    if (user?.phone) {
      await fetchWalletBalance(user.phone)
    }
  }

  // Check for saved user on mount and fetch balance
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        // Check if user is restricted
        if (userData.isRestricted && !userData.isAdmin) {
          showAlert('error', 'Your account has been restricted. Please contact support.')
          localStorage.removeItem('user')
          setActiveTab('account')
          return
        }
        setUser(userData)
        // Set default tab based on user role
        if (userData.isAdmin) {
          setActiveTab('admin-dashboard')
        } else {
          setActiveTab('home')
        }
        // Fetch wallet balance from backend (only for regular users)
        if (!userData.isAdmin) {
          fetchWalletBalance(userData.phone)
        }
      } catch (error) {
        console.error('Error loading saved user:', error)
        localStorage.removeItem('user')
        setActiveTab('account') // Go to login if error
      }
    } else {
      // No saved user, ensure we're on login page
      setActiveTab('account')
    }
  }, [])

      // Redirect to login if not logged in and trying to access protected pages
      useEffect(() => {
        if (!user && activeTab !== 'account') {
          // Only redirect if it's a protected page (not already on account/login)
          const protectedTabs = ['home', 'matches', 'earnings', 'recharge', 'withdrawal', 'payment', 'payment-methods', 'my-orders', 'refer-and-earn', 'admin-dashboard', 'admin-withdrawals', 'admin-payments', 'admin-users', 'admin-referral-settings']
          if (protectedTabs.includes(activeTab)) {
            setActiveTab('account')
          }
        }
      }, [user, activeTab])

  const renderPage = () => {
    // Check if user is restricted (not admin)
    if (user && !user.isAdmin && user.isRestricted) {
      return (
        <div className='flex flex-col items-center justify-center min-h-screen p-4'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center'>
            <h2 className='text-xl font-bold text-red-600 mb-2'>Account Restricted</h2>
            <p className='text-sm text-red-700 mb-4'>
              Your account has been restricted. Please contact support for assistance.
            </p>
            <button
              onClick={handleLogout}
              className='bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors'
            >
              Logout
            </button>
          </div>
        </div>
      )
    }
    
    // Admin pages
    if (user?.isAdmin) {
      switch (activeTab) {
        case 'admin-dashboard':
          return <AdminDashboard user={user} setActiveTab={setActiveTab} onLogout={handleLogout} />
        case 'admin-withdrawals':
          return <AdminWithdrawals user={user} refreshWalletBalance={refreshWalletBalance} />
        case 'admin-payments':
          return <AdminPayments user={user} refreshWalletBalance={refreshWalletBalance} />
        case 'admin-users':
          return <AdminUsers user={user} onLogout={handleLogout} />
        case 'admin-referral-settings':
          return <AdminReferralSettings user={user} />
        case 'admin-loss-tracking':
          return <AdminLossTracking user={user} />
        default:
          return <AdminDashboard user={user} setActiveTab={setActiveTab} />
      }
    }
    
    // User pages
    switch (activeTab) {
      case 'home':
        return <Home user={user} setActiveTab={setActiveTab} walletBalance={walletBalance} refreshWalletBalance={refreshWalletBalance} />
      case 'matches':
        return <Matches user={user} setActiveTab={setActiveTab} />
      case 'earnings':
        return <Earnings user={user} setActiveTab={setActiveTab} refreshWalletBalance={refreshWalletBalance} />
      case 'recharge':
        return <Recharge user={user} refreshWalletBalance={refreshWalletBalance} setActiveTab={setActiveTab} setPaymentData={setPaymentData} />
      case 'withdrawal':
        return <Withdrawal user={user} walletBalance={walletBalance} refreshWalletBalance={refreshWalletBalance} setActiveTab={setActiveTab} />
      case 'payment':
        return <Payment 
          user={user} 
          amount={paymentData?.amount} 
          transaction={paymentData?.transaction}
          onClose={() => {
            // Clear payment data and go back to recharge
            // Transaction is already created and visible in My Orders
            setPaymentData(null)
            setActiveTab('recharge')
          }}
          setActiveTab={setActiveTab}
        />
      case 'account':
        return <Account user={user} onLogin={handleLogin} onLogout={handleLogout} walletBalance={walletBalance} refreshWalletBalance={refreshWalletBalance} setActiveTab={setActiveTab} />
      case 'payment-methods':
        return <PaymentMethods user={user} setActiveTab={setActiveTab} onBack={() => setActiveTab('account')} />
      case 'my-orders':
        return <MyOrders user={user} setActiveTab={setActiveTab} onBack={() => setActiveTab('account')} />
      case 'refer-and-earn':
        return <ReferAndEarn user={user} setActiveTab={setActiveTab} onBack={() => setActiveTab('account')} />
      default:
        // Redirect to login if not logged in, otherwise to home
        if (!user) {
          return <Account user={user} onLogin={handleLogin} onLogout={handleLogout} walletBalance={walletBalance} refreshWalletBalance={refreshWalletBalance} />
        }
        return <Home user={user} setActiveTab={setActiveTab} walletBalance={walletBalance} refreshWalletBalance={refreshWalletBalance} />
    }
  }

  return (
    <div className='app-container bg-white'>
      <div className='app-content'>
        {renderPage()}
      </div>
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      
      {/* Global Alert Component */}
      <Alert
        isOpen={alert.isOpen}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
    </div>
  )
}

export default App
