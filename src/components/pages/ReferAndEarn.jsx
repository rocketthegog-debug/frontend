import { useState, useEffect } from 'react'
import { APP_CONFIG } from '../../config'
import { getReferralLink } from '../../services/api'
import { HiOutlineShare, HiOutlineClipboardCopy, HiOutlineArrowLeft } from 'react-icons/hi'

function ReferAndEarn({ user, setActiveTab, onBack }) {
    const [referralData, setReferralData] = useState(null)
    const [loadingReferral, setLoadingReferral] = useState(false)
    const [copied, setCopied] = useState(false)
    const [copiedType, setCopiedType] = useState('') // 'code' or 'link'

    useEffect(() => {
        if (user && !user.isAdmin) {
            loadReferralData()
        }
    }, [user])

    const loadReferralData = async () => {
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

    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setCopiedType(type)
            setTimeout(() => {
                setCopied(false)
                setCopiedType('')
            }, 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
        }
    }

    return (
        <div className='flex flex-col pb-20'>
            {/* Header */}
            <div className='sticky top-0 z-10 bg-white pb-4 pt-4 px-4 border-b border-gray-200'>
                <div className='flex items-center gap-3 mb-3'>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                        >
                            <HiOutlineArrowLeft className='text-xl text-crickbuzz-text' />
                        </button>
                    )}
                    <div className='flex items-center gap-2'>
                        <HiOutlineShare className='text-2xl text-purple-600' />
                        <h2 className='text-2xl font-bold text-crickbuzz-text'>Referral Program</h2>
                    </div>
                </div>
            </div>

            <div className='px-4 pt-4'>
                {loadingReferral ? (
                    <div className='text-center py-8'>
                        <p className='text-sm text-crickbuzz-text-light'>Loading referral information...</p>
                    </div>
                ) : referralData && referralData.isActive ? (
                    <div className='space-y-4'>
                        {/* Referral Code Section */}
                        <div className='bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200'>
                            <p className='text-xs font-semibold text-crickbuzz-text-light mb-2'>Your Referral Code</p>
                            <div className='flex items-center gap-2'>
                                <code className='flex-1 bg-white rounded-lg px-4 py-3 text-sm font-bold text-purple-600 border border-purple-200'>
                                    {referralData.referralCode}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(referralData.referralCode, 'code')}
                                    className='bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors'
                                >
                                    <HiOutlineClipboardCopy className='text-lg' />
                                </button>
                            </div>
                            {copied && copiedType === 'code' && (
                                <div className='mt-2 bg-green-100 border border-green-300 rounded-lg p-2'>
                                    <p className='text-xs text-green-700 font-medium'>✓ Referral code copied to clipboard!</p>
                                </div>
                            )}
                        </div>

                        {/* Referral Link Section */}
                        <div className='bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200'>
                            <p className='text-xs font-semibold text-crickbuzz-text-light mb-2'>Referral Link</p>
                            <div className='flex items-center gap-2'>
                                <input
                                    type='text'
                                    value={referralData.referralLink}
                                    readOnly
                                    className='flex-1 bg-white rounded-lg px-4 py-3 text-xs text-crickbuzz-text border border-purple-200'
                                />
                                <button
                                    onClick={() => copyToClipboard(referralData.referralLink, 'link')}
                                    className='bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors'
                                >
                                    <HiOutlineClipboardCopy className='text-lg' />
                                </button>
                            </div>
                            {copied && copiedType === 'link' && (
                                <div className='mt-2 bg-green-100 border border-green-300 rounded-lg p-2'>
                                    <p className='text-xs text-green-700 font-medium'>✓ Referral link copied to clipboard!</p>
                                </div>
                            )}
                        </div>

                        {/* Stats Cards */}
                        <div className='grid grid-cols-2 gap-3'>
                            <div className='bg-white rounded-lg p-4 text-center border border-purple-200 shadow-sm'>
                                <p className='text-xs text-crickbuzz-text-light mb-2'>Total Referrals</p>
                                <p className='text-3xl font-bold text-purple-600'>{referralData.totalReferrals}</p>
                            </div>
                            <div className='bg-white rounded-lg p-4 text-center border border-purple-200 shadow-sm'>
                                <p className='text-xs text-crickbuzz-text-light mb-2'>You Earn</p>
                                <p className='text-3xl font-bold text-purple-600'>
                                    {APP_CONFIG.currency} {referralData.rewardInfo.referrerReward}
                                </p>
                            </div>
                        </div>

                        {/* Reward Info */}
                        <div className='bg-white rounded-lg p-4 border border-purple-200'>
                            <p className='text-xs font-semibold text-crickbuzz-text-light mb-2'>Reward Info</p>
                            <p className='text-xs text-crickbuzz-text leading-relaxed'>
                                When someone registers using your link, you both get rewards! 
                                You get <span className='font-bold text-purple-600'>{APP_CONFIG.currency} {referralData.rewardInfo.referrerReward}</span> and 
                                they get <span className='font-bold text-purple-600'>{APP_CONFIG.currency} {referralData.rewardInfo.referredReward}</span>.
                            </p>
                        </div>

                        {/* How It Works */}
                        <div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
                            <p className='text-xs font-semibold text-purple-800 mb-2'>How It Works:</p>
                            <ol className='text-xs text-purple-700 space-y-1.5 list-decimal list-inside'>
                                <li>Share your referral link or code with friends</li>
                                <li>When they register using your link, they enter your referral code</li>
                                <li>Both of you instantly receive rewards in your wallet</li>
                                <li>You can refer unlimited friends and earn rewards for each referral</li>
                            </ol>
                        </div>
                    </div>
                ) : (
                    <div className='text-center py-8'>
                        <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
                            <p className='text-sm font-semibold text-red-700 mb-2'>Referral Program Inactive</p>
                            <p className='text-xs text-red-600 mb-4'>The referral program is currently disabled. Please check back later.</p>
                        <button
                            onClick={loadReferralData}
                                className='bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors'
                        >
                                Refresh
                        </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReferAndEarn

