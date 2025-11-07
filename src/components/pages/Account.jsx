import { useState, useEffect } from 'react'
import { APP_CONFIG } from '../../config'
import Login from './Login'
import { CgProfile } from 'react-icons/cg'
import { MdOutlineShoppingBag, MdOutlinePayment, MdOutlineSettings } from 'react-icons/md'
import { FiLogOut } from 'react-icons/fi'
import { HiOutlineGift } from 'react-icons/hi'
import { getReferralLink } from '../../services/api'
import Alert from '../Alert'

function Account({ user, onLogin, onLogout, walletBalance, refreshWalletBalance, setActiveTab }) {
    const [referralData, setReferralData] = useState(null)
    const [loadingReferral, setLoadingReferral] = useState(false)
    const [alert, setAlert] = useState({ isOpen: false, type: 'info', message: '' })

    // If not logged in, show login page
    if (!user) {
        return <Login onLogin={onLogin} />
    }

    const showAlert = (type, message) => {
        setAlert({ isOpen: true, type, message })
    }

    useEffect(() => {
    const loadReferralData = async () => {
            // Check if user exists before accessing properties
            if (!user || !user.phone || user.isAdmin) {
                setReferralData(null)
                return
            }
            
        try {
            setLoadingReferral(true)
            const response = await getReferralLink(user.phone)
                if (response.success && response.data?.isActive) {
                setReferralData(response.data)
                } else {
                    // Program is inactive or failed to load
                    setReferralData(null)
            }
        } catch (error) {
            console.error('Error loading referral data:', error)
                setReferralData(null)
        } finally {
            setLoadingReferral(false)
        }
    }

        if (user && !user.isAdmin && user.phone) {
            loadReferralData()
        } else {
            setReferralData(null)
        }
    }, [user])



    return (
        <div className='flex flex-col pb-20'>
            {/* Sticky Wallet Balance Header */}
            <div className='sticky top-0 z-10 bg-white pb-3 pt-3 px-4 border-b border-gray-200'>
                <div className='flex items-center justify-between gap-3'>
                    <h2 className='text-xl font-bold text-crickbuzz-text'>My Account</h2>
                    {/* Wallet Card */}
                    <div className='bg-crickbuzz-green text-white rounded-lg px-3 py-2 flex items-center gap-2'>
                        <p className='text-xs opacity-90 font-medium'>Wallet:</p>
                        <p className='text-base font-bold'>{APP_CONFIG.currency} {walletBalance.toLocaleString()}</p>
                    </div>
                </div>
            </div>
            
            <div className='space-y-2 px-4 pt-4'>
                {/* Profile Card */}
                <div className='bg-crickbuzz-light rounded-lg p-4 text-center'>
                    <div className='flex justify-center mb-2'>
                        <div className='bg-crickbuzz-green rounded-full p-3'>
                            <CgProfile className='text-2xl text-white' />
                        </div>
                    </div>
                    <h3 className='text-sm font-semibold text-crickbuzz-text'>{user.name}</h3>
                    <p className='text-xs text-crickbuzz-text-light mt-1'>{user.phone}</p>
                </div>

                {/* Menu Items */}
                <div className='space-y-1.5 mt-3'>
                    <button 
                        onClick={() => setActiveTab('my-orders')}
                        className='w-full flex items-center gap-2 bg-crickbuzz-light p-3 rounded-lg hover:bg-crickbuzz-green hover:text-white transition-colors text-xs font-semibold text-crickbuzz-text'
                    >
                        <MdOutlineShoppingBag className='text-base' />
                        <span>My Orders</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('payment-methods')}
                        className='w-full flex items-center gap-2 bg-crickbuzz-light p-3 rounded-lg hover:bg-crickbuzz-green hover:text-white transition-colors text-xs font-semibold text-crickbuzz-text'
                    >
                        <MdOutlinePayment className='text-base' />
                        <span>Payment Methods</span>
                    </button>
                    <button 
                        onClick={() => {
                            // Settings placeholder - can add settings page later
                            showAlert('info', 'Settings coming soon!')
                        }}
                        className='w-full flex items-center gap-2 bg-crickbuzz-light p-3 rounded-lg hover:bg-crickbuzz-green hover:text-white transition-colors text-xs font-semibold text-crickbuzz-text'
                    >
                        <MdOutlineSettings className='text-base' />
                        <span>Settings</span>
                    </button>
                    {!user.isAdmin && referralData && referralData.isActive && (
                        <button 
                            onClick={() => setActiveTab('refer-and-earn')}
                            className='w-full flex items-center justify-between bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-lg hover:from-purple-200 hover:to-blue-200 transition-colors text-xs font-semibold text-purple-700 border border-purple-300'
                        >
                            <div className='flex items-center gap-2'>
                                <HiOutlineGift className='text-base' />
                                <span>Refer and Earn</span>
                            </div>
                            <span className='font-bold text-purple-600'>
                                {APP_CONFIG.currency} {referralData.rewardInfo.referrerReward}
                            </span>
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            if (onLogout) {
                                onLogout()
                            }
                            // Ensure navigation to login page
                            if (setActiveTab) {
                                setActiveTab('account')
                            }
                        }}
                        className='w-full flex items-center gap-2 bg-crickbuzz-light p-3 rounded-lg hover:bg-red-50 transition-colors text-xs font-semibold text-red-600 hover:text-red-700'
                    >
                        <FiLogOut className='text-base' />
                        <span>Logout</span>
                    </button>
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

export default Account
