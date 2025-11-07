import { useState, useEffect } from 'react'
import { APP_CONFIG } from '../../../config'
import { getReferralSettings, updateReferralSettings } from '../../../services/api'
import { HiOutlineGift, HiOutlineCheckCircle } from 'react-icons/hi'

function AdminReferralSettings({ user }) {
    const [settings, setSettings] = useState({
        referrerReward: 10,
        referredReward: 10,
        isActive: true,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            setLoading(true)
            const response = await getReferralSettings(user.phone)
            if (response.success) {
                // Extract only the fields we need (ignore totalRewardAmount if it exists)
                const { referrerReward, referredReward, isActive } = response.data
                setSettings({
                    referrerReward: referrerReward || 10,
                    referredReward: referredReward || 10,
                    isActive: isActive !== undefined ? isActive : true,
                })
            } else {
                setError('Failed to load referral settings')
            }
        } catch (error) {
            console.error('Error loading settings:', error)
            setError('Failed to load referral settings')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            setMessage('')
            setError('')

            // Validation
            if (settings.referrerReward < 0 || settings.referredReward < 0) {
                setError('All amounts must be non-negative')
                setSaving(false)
                return
            }

            // Only send referrerReward, referredReward, and isActive (exclude totalRewardAmount)
            const { referrerReward, referredReward, isActive } = settings
            const response = await updateReferralSettings(user.phone, {
                referrerReward,
                referredReward,
                isActive,
            })
            if (response.success) {
                setMessage('Referral settings updated successfully!')
                setTimeout(() => setMessage(''), 3000)
            } else {
                setError(response.message || 'Failed to update settings')
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            setError('Failed to update referral settings')
        } finally {
            setSaving(false)
        }
    }

    const handleReferrerChange = (value) => {
        const referrerReward = parseFloat(value) || 0
        setSettings({
            ...settings,
            referrerReward,
        })
    }

    const handleReferredChange = (value) => {
        const referredReward = parseFloat(value) || 0
        setSettings({
            ...settings,
            referredReward,
        })
    }

    if (loading) {
        return (
            <div className='flex flex-col py-4 px-4 pb-20'>
                <h2 className='text-2xl font-bold text-crickbuzz-text mb-4'>Referral Settings</h2>
                <div className='text-center py-8'>
                    <p className='text-sm text-crickbuzz-text-light'>Loading settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-col py-4 px-4 pb-20'>
            <div className='flex items-center gap-2 mb-4'>
                <HiOutlineGift className='text-2xl text-purple-600' />
                <h2 className='text-2xl font-bold text-crickbuzz-text'>Referral Settings</h2>
            </div>

            {message && (
                <div className='mb-4 bg-green-50 border border-green-200 rounded-lg p-3'>
                    <div className='flex items-center gap-2'>
                        <HiOutlineCheckCircle className='text-green-600' />
                        <p className='text-xs text-green-700 font-medium'>{message}</p>
                    </div>
                </div>
            )}

            {error && (
                <div className='mb-4 bg-red-50 border border-red-200 rounded-lg p-3'>
                    <p className='text-xs text-red-700 font-medium'>{error}</p>
                </div>
            )}

            <div className='bg-crickbuzz-light rounded-lg p-4 space-y-4'>
                {/* Active Toggle */}
                <div className='flex items-center justify-between'>
                    <div>
                        <p className='text-sm font-semibold text-crickbuzz-text'>Referral Program Status</p>
                        <p className='text-xs text-crickbuzz-text-light'>Enable or disable the referral program</p>
                    </div>
                    <label className='relative inline-flex items-center cursor-pointer'>
                        <input
                            type='checkbox'
                            checked={settings.isActive}
                            onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                            className='sr-only peer'
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>

                <div className='border-t border-gray-300 pt-4'>
                    <p className='text-sm font-semibold text-crickbuzz-text mb-3'>Reward Amounts</p>
                    
                    {/* Referrer Reward */}
                    <div className='mb-3'>
                        <label className='block text-xs font-semibold text-crickbuzz-text mb-1.5'>
                            Referrer Reward ({APP_CONFIG.currency})
                        </label>
                        <input
                            type='number'
                            value={settings.referrerReward}
                            onChange={(e) => handleReferrerChange(e.target.value)}
                            min='0'
                            step='0.01'
                            className='w-full bg-white rounded-lg px-3 py-2 text-crickbuzz-text focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-30 text-sm'
                        />
                        <p className='text-xs text-crickbuzz-text-light mt-1'>
                            Amount the referrer receives when someone signs up using their link
                        </p>
                    </div>

                    {/* Referred Reward */}
                    <div className='mb-3'>
                        <label className='block text-xs font-semibold text-crickbuzz-text mb-1.5'>
                            Referred User Reward ({APP_CONFIG.currency})
                        </label>
                        <input
                            type='number'
                            value={settings.referredReward}
                            onChange={(e) => handleReferredChange(e.target.value)}
                            min='0'
                            step='0.01'
                            className='w-full bg-white rounded-lg px-3 py-2 text-crickbuzz-text focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-30 text-sm'
                        />
                        <p className='text-xs text-crickbuzz-text-light mt-1'>
                            Amount the new user receives when they sign up using a referral link
                        </p>
                    </div>

                    {/* Info */}
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                        <p className='text-xs text-blue-700 font-medium mb-1'>Current Settings:</p>
                        <p className='text-xs text-blue-600'>
                            Referrer gets: {APP_CONFIG.currency} {settings.referrerReward} | 
                            Referred gets: {APP_CONFIG.currency} {settings.referredReward} | 
                            Total: {APP_CONFIG.currency} {(settings.referrerReward + settings.referredReward).toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className='w-full bg-purple-600 text-white font-bold py-2.5 rounded-lg transition-all hover:bg-purple-700 hover:shadow-lg active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            {/* Info Card */}
            <div className='mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4'>
                <p className='text-xs font-semibold text-purple-800 mb-2'>How it works:</p>
                <ul className='text-xs text-purple-700 space-y-1 list-disc list-inside'>
                    <li>When a user registers with a referral code, both users receive rewards</li>
                    <li>The referrer gets the "Referrer Reward" amount</li>
                    <li>The new user gets the "Referred User Reward" amount</li>
                    <li>Rewards are automatically added to their wallet balances</li>
                    <li>You can disable the program anytime by toggling the status</li>
                </ul>
            </div>
        </div>
    )
}

export default AdminReferralSettings

