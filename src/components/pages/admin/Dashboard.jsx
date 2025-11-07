import { useState, useEffect } from 'react'
import { APP_CONFIG } from '../../../config'
import { getUserTransactions } from '../../../services/api'
import { IoStatsChartOutline, IoWalletOutline, IoPeopleOutline, IoDocumentTextOutline, IoLogOutOutline, IoRefreshOutline, IoChevronForwardOutline } from 'react-icons/io5'
import { HiOutlineGift } from 'react-icons/hi'
import { FiLogOut } from 'react-icons/fi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

function AdminDashboard({ user, setActiveTab, onLogout }) {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTransactions: 0,
        pendingTransactions: 0,
        totalBalance: 0
    })
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            setLoading(true)
            
            // Fetch all users
            const usersRes = await fetch(`${API_BASE_URL}/admin/users`)
            const usersData = await usersRes.json()
            
            // Fetch processing transactions
            const transactionsRes = await fetch(`${API_BASE_URL}/admin/transactions?status=processing`)
            const transactionsData = await transactionsRes.json()
            
            // Fetch all transactions
            const allTransactionsRes = await fetch(`${API_BASE_URL}/admin/transactions`)
            const allTransactionsData = await allTransactionsRes.json()

            if (usersData.success && transactionsData.success && allTransactionsData.success) {
                const totalBalance = usersData.data.reduce((sum, u) => sum + (u.walletBalance || 0), 0)
                
                setStats({
                    totalUsers: usersData.data.length,
                    totalTransactions: allTransactionsData.data.length,
                    pendingTransactions: transactionsData.data.length,
                    totalBalance
                })
            }
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadStats()
    }

    const handleStatClick = (tab) => {
        if (tab) {
            setActiveTab(tab)
        }
    }

    return (
        <div className='flex flex-col py-4 px-4 pb-20'>
            {/* Header */}
            <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-bold text-crickbuzz-text'>Admin Dashboard</h2>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    className='p-2 rounded-lg bg-crickbuzz-light hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    title='Refresh Stats'
                >
                    <IoRefreshOutline className={`text-lg text-crickbuzz-text ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>
            
            {loading ? (
                <div className='text-center py-12'>
                    <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-crickbuzz-green mb-3'></div>
                    <p className='text-sm text-crickbuzz-text-light'>Loading statistics...</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className='grid grid-cols-2 gap-3 mb-4'>
                        <button
                            onClick={() => handleStatClick('admin-users')}
                            className='bg-gradient-to-br from-crickbuzz-green to-green-600 text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all active:scale-95 text-left'
                        >
                            <div className='flex items-center gap-2 mb-2'>
                                <div className='bg-white/20 rounded-full p-2'>
                                    <IoPeopleOutline className='text-lg' />
                                </div>
                                <p className='text-xs opacity-90 font-medium'>Total Users</p>
                            </div>
                            <p className='text-2xl font-bold'>{stats.totalUsers}</p>
                            <div className='flex items-center gap-1 mt-2 text-xs opacity-80'>
                                <span>View all</span>
                                <IoChevronForwardOutline className='text-xs' />
                        </div>
                        </button>
                        
                        <button
                            onClick={() => handleStatClick('admin-withdrawals')}
                            className='bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all active:scale-95 text-left'
                        >
                            <div className='flex items-center gap-2 mb-2'>
                                <div className='bg-white/20 rounded-full p-2'>
                                    <IoDocumentTextOutline className='text-lg' />
                                </div>
                                <p className='text-xs opacity-90 font-medium'>Transactions</p>
                            </div>
                            <p className='text-2xl font-bold'>{stats.totalTransactions}</p>
                            <div className='flex items-center gap-1 mt-2 text-xs opacity-80'>
                                <span>View all</span>
                                <IoChevronForwardOutline className='text-xs' />
                        </div>
                        </button>
                        
                        <button
                            onClick={() => handleStatClick('admin-withdrawals')}
                            className='bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all active:scale-95 text-left'
                        >
                            <div className='flex items-center gap-2 mb-2'>
                                <div className='bg-white/20 rounded-full p-2'>
                                    <IoStatsChartOutline className='text-lg' />
                                </div>
                                <p className='text-xs opacity-90 font-medium'>Pending</p>
                            </div>
                            <p className='text-2xl font-bold'>{stats.pendingTransactions}</p>
                            {stats.pendingTransactions > 0 && (
                                <div className='flex items-center gap-1 mt-2 text-xs opacity-80'>
                                    <span>Review now</span>
                                    <IoChevronForwardOutline className='text-xs' />
                        </div>
                            )}
                        </button>
                        
                        <div className='bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-md text-left'>
                            <div className='flex items-center gap-2 mb-2'>
                                <div className='bg-white/20 rounded-full p-2'>
                                    <IoWalletOutline className='text-lg' />
                                </div>
                                <p className='text-xs opacity-90 font-medium'>Total Balance</p>
                            </div>
                            <p className='text-xl font-bold'>{APP_CONFIG.currency} {stats.totalBalance.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className='bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100'>
                        <p className='text-xs font-bold text-crickbuzz-text mb-3 uppercase tracking-wide'>Quick Actions</p>
                        <div className='space-y-2'>
                            <button
                                onClick={() => setActiveTab('admin-users')}
                                className='w-full flex items-center justify-between bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-3 rounded-lg transition-all text-xs font-semibold text-purple-700 active:scale-98'
                            >
                                <div className='flex items-center gap-2'>
                                    <IoPeopleOutline className='text-base' />
                                    <span>Manage Users</span>
                                </div>
                                <IoChevronForwardOutline className='text-sm' />
                            </button>
                            
                            <button
                                onClick={() => setActiveTab('admin-withdrawals')}
                                className='w-full flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-3 rounded-lg transition-all text-xs font-semibold text-blue-700 active:scale-98'
                            >
                                <div className='flex items-center gap-2'>
                                    <IoDocumentTextOutline className='text-base' />
                                    <span>Withdrawals</span>
                                </div>
                                <IoChevronForwardOutline className='text-sm' />
                            </button>
                            
                            <button
                                onClick={() => setActiveTab('admin-payments')}
                                className='w-full flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-3 rounded-lg transition-all text-xs font-semibold text-green-700 active:scale-98'
                            >
                                <div className='flex items-center gap-2'>
                                    <IoWalletOutline className='text-base' />
                                    <span>Payments</span>
                                </div>
                                <IoChevronForwardOutline className='text-sm' />
                            </button>
                            
                            <button
                                onClick={() => setActiveTab('admin-referral-settings')}
                                className='w-full flex items-center justify-between bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 p-3 rounded-lg transition-all text-xs font-semibold text-amber-700 active:scale-98'
                            >
                                <div className='flex items-center gap-2'>
                                <HiOutlineGift className='text-base' />
                                    <span>Referral Settings</span>
                                </div>
                                <IoChevronForwardOutline className='text-sm' />
                            </button>
                            
                            <button
                                onClick={() => setActiveTab('admin-loss-tracking')}
                                className='w-full flex items-center justify-between bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 p-3 rounded-lg transition-all text-xs font-semibold text-red-700 active:scale-98'
                            >
                                <div className='flex items-center gap-2'>
                                    <IoStatsChartOutline className='text-base' />
                                    <span>Loss Tracking</span>
                                </div>
                                <IoChevronForwardOutline className='text-sm' />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default AdminDashboard

