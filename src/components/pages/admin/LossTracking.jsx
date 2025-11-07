import { useState, useEffect } from 'react'
import { APP_CONFIG } from '../../../config'
import { getLossTracking } from '../../../services/api'
import { IoTrendingDownOutline, IoPeopleOutline, IoWalletOutline, IoRefreshOutline } from 'react-icons/io5'

function LossTracking({ user }) {
    const [lossData, setLossData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        loadLossTracking()
    }, [])

    const loadLossTracking = async () => {
        try {
            setLoading(true)
            const response = await getLossTracking(user?.phone)
            if (response.success) {
                setLossData(response.data)
            }
        } catch (error) {
            console.error('Error loading loss tracking:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadLossTracking()
    }

    if (loading) {
        return (
            <div className='flex flex-col py-4 px-4 pb-20'>
                <div className='text-center py-12'>
                    <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-crickbuzz-green mb-3'></div>
                    <p className='text-sm text-crickbuzz-text-light'>Loading loss tracking...</p>
                </div>
            </div>
        )
    }

    if (!lossData) {
        return (
            <div className='flex flex-col py-4 px-4 pb-20'>
                <div className='text-center py-12'>
                    <p className='text-sm text-red-600'>Failed to load loss tracking data</p>
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-col py-4 px-4 pb-20'>
            {/* Header */}
            <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-bold text-crickbuzz-text'>Loss Tracking</h2>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className='p-2 rounded-lg bg-crickbuzz-light hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    title='Refresh'
                >
                    <IoRefreshOutline className={`text-lg text-crickbuzz-text ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Summary Cards */}
            <div className='grid grid-cols-2 gap-3 mb-4'>
                <div className='bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4 shadow-md'>
                    <div className='flex items-center gap-2 mb-2'>
                        <div className='bg-white/20 rounded-full p-2'>
                            <IoTrendingDownOutline className='text-lg' />
                        </div>
                        <p className='text-xs opacity-90 font-medium'>Total Loss</p>
                    </div>
                    <p className='text-2xl font-bold'>{APP_CONFIG.currency} {parseFloat(lossData.summary.totalNetLoss).toLocaleString()}</p>
                </div>

                <div className='bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-md'>
                    <div className='flex items-center gap-2 mb-2'>
                        <div className='bg-white/20 rounded-full p-2'>
                            <IoPeopleOutline className='text-lg' />
                        </div>
                        <p className='text-xs opacity-90 font-medium'>Total Users</p>
                    </div>
                    <p className='text-2xl font-bold'>{lossData.summary.totalUsers}</p>
                </div>

                <div className='bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 shadow-md'>
                    <div className='flex items-center gap-2 mb-2'>
                        <div className='bg-white/20 rounded-full p-2'>
                            <IoWalletOutline className='text-lg' />
                        </div>
                        <p className='text-xs opacity-90 font-medium'>Total CP</p>
                    </div>
                    <p className='text-xl font-bold'>{APP_CONFIG.currency} {parseFloat(lossData.summary.totalCP).toLocaleString()}</p>
                </div>

                <div className='bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-4 shadow-md'>
                    <div className='flex items-center gap-2 mb-2'>
                        <div className='bg-white/20 rounded-full p-2'>
                            <IoWalletOutline className='text-lg' />
                        </div>
                        <p className='text-xs opacity-90 font-medium'>Total Withdrawn</p>
                    </div>
                    <p className='text-xl font-bold'>{APP_CONFIG.currency} {parseFloat(lossData.summary.totalWithdrawn).toLocaleString()}</p>
                </div>
            </div>

            {/* Users List */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
                <div className='p-3 border-b border-gray-200'>
                    <p className='text-xs font-bold text-crickbuzz-text uppercase tracking-wide'>User Loss Details</p>
                </div>
                <div className='divide-y divide-gray-100'>
                    {lossData.users.length === 0 ? (
                        <div className='p-6 text-center'>
                            <p className='text-sm text-crickbuzz-text-light'>No users found</p>
                        </div>
                    ) : (
                        lossData.users.map((userData) => (
                            <div key={userData.userId} className='p-3'>
                                <div className='flex items-center justify-between mb-2'>
                                    <div>
                                        <p className='text-sm font-semibold text-crickbuzz-text'>{userData.userName}</p>
                                        <p className='text-xs text-crickbuzz-text-light'>{userData.userId}</p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-sm font-bold text-red-600'>
                                            Loss: {APP_CONFIG.currency} {userData.netLoss.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className='grid grid-cols-3 gap-2 text-xs'>
                                    <div>
                                        <p className='text-crickbuzz-text-light mb-0.5'>CP</p>
                                        <p className='font-semibold text-green-600'>{APP_CONFIG.currency} {userData.cp.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className='text-crickbuzz-text-light mb-0.5'>Earnings</p>
                                        <p className='font-semibold text-amber-600'>{APP_CONFIG.currency} {userData.loss.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className='text-crickbuzz-text-light mb-0.5'>Withdrawn</p>
                                        <p className='font-semibold text-blue-600'>{APP_CONFIG.currency} {userData.totalWithdrawn.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default LossTracking

