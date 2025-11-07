import { useState, useEffect } from 'react'
import { APP_CONFIG } from '../../config'
import { login, register, verifyReferralCode } from '../../services/api'
import { IoClose } from 'react-icons/io5'

function Login({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true) // Toggle between Login and Register
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [referralCode, setReferralCode] = useState('')
    const [referrerName, setReferrerName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [verifyingReferral, setVerifyingReferral] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [showTerms, setShowTerms] = useState(false)
    const [maxWidth, setMaxWidth] = useState('100%')

    // Check for referral code in URL on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const ref = urlParams.get('ref')
        if (ref) {
            setReferralCode(ref)
            setIsLogin(false) // Switch to register mode
            verifyReferralCodeFromURL(ref)
        }
    }, [])

    // Get app container width for desktop constraint (for Terms modal)
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

        if (showTerms) {
            updateMaxWidth()
            window.addEventListener('resize', updateMaxWidth)
            return () => window.removeEventListener('resize', updateMaxWidth)
        }
    }, [showTerms])

    const verifyReferralCodeFromURL = async (code) => {
        setVerifyingReferral(true)
        const result = await verifyReferralCode(code)
        if (result.success && result.valid) {
            setReferrerName(result.data.referrerName)
        } else {
            setError('Invalid referral code')
            setReferralCode('')
        }
        setVerifyingReferral(false)
    }

    const handleReferralCodeChange = async (e) => {
        const code = e.target.value.toUpperCase()
        setReferralCode(code)
        setReferrerName('')
        
        if (code.length >= 6) {
            setVerifyingReferral(true)
            const result = await verifyReferralCode(code)
            if (result.success && result.valid) {
                setReferrerName(result.data.referrerName)
                setError('')
            } else {
                setReferrerName('')
                if (code.length > 0) {
                    setError('Invalid referral code')
                }
            }
            setVerifyingReferral(false)
        } else {
            setError('')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        
        // Validation
        if (!phone || !password) {
            setError('Please enter phone number and password')
            setLoading(false)
            return
        }

        // Phone validation - should be 10 digits
        const phoneRegex = /^[0-9]{10}$/
        if (!phoneRegex.test(phone)) {
            setError('Please enter a valid 10-digit phone number')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        if (!isLogin && !name) {
            setError('Please enter your name')
            setLoading(false)
            return
        }

        if (!isLogin && name.length < 2) {
            setError('Name must be at least 2 characters')
            setLoading(false)
            return
        }

        if (!isLogin && !acceptedTerms) {
            setError('Please accept the Terms and Conditions to continue')
            setLoading(false)
            return
        }

        try {
            let response
            if (isLogin) {
                response = await login(phone, password)
            } else {
                response = await register(phone, name, password, referralCode || null)
            }

            if (response.success) {
                // Call onLogin with user data from backend
                onLogin(response.data)
            } else {
                setError(response.message || 'Something went wrong. Please try again.')
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.')
            console.error('Login/Register error:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <style>{`
                .terms-modal::-webkit-scrollbar {
                    display: none;
                }
                .terms-modal {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div className='flex flex-col py-4 px-4 pb-20'>
            {/* Compact Header */}
            <div className='mb-4 text-center'>
                <h2 className='text-2xl font-bold text-crickbuzz-text mb-1'>{APP_CONFIG.appName}</h2>
                <p className='text-xs text-crickbuzz-text-light'>
                    {isLogin ? 'Welcome back!' : 'Create your account'}
                </p>
            </div>

            {/* Toggle Buttons */}
            <div className='bg-crickbuzz-light rounded-lg p-1 mb-4 flex gap-1'>
                <button
                    onClick={() => {
                        setIsLogin(true)
                        setError('')
                        setName('')
                    }}
                    className={`flex-1 py-2 rounded-lg font-semibold text-xs transition-all ${
                        isLogin
                            ? 'bg-crickbuzz-green text-white shadow-md'
                            : 'text-crickbuzz-text hover:bg-white'
                    }`}
                >
                    Login
                </button>
                <button
                    onClick={() => {
                        setIsLogin(false)
                        setError('')
                        setPassword('')
                        // Check URL for referral code when switching to register
                        const urlParams = new URLSearchParams(window.location.search)
                        const ref = urlParams.get('ref')
                        if (ref) {
                            setReferralCode(ref)
                            verifyReferralCodeFromURL(ref)
                        }
                    }}
                    className={`flex-1 py-2 rounded-lg font-semibold text-xs transition-all ${
                        !isLogin
                            ? 'bg-crickbuzz-green text-white shadow-md'
                            : 'text-crickbuzz-text hover:bg-white'
                    }`}
                >
                    Register
                </button>
            </div>


            {/* Form Card - Single Card */}
            <form onSubmit={handleSubmit}>
                <div className='bg-crickbuzz-light rounded-lg p-4 space-y-3'>
                    {/* Name Field - Only for Register */}
                    {!isLogin && (
                        <div className='animate-slideDown'>
                            <label className='block text-xs font-semibold text-crickbuzz-text mb-1.5'>
                                Full Name
                            </label>
                            <input
                                type='text'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder='Enter your full name'
                                className='w-full bg-white rounded-lg px-3 py-2 text-crickbuzz-text placeholder-crickbuzz-text-light focus:outline-none focus:ring-2 focus:ring-crickbuzz-green focus:ring-opacity-30 text-sm transition-all'
                            />
                        </div>
                    )}

                    {/* Phone Input */}
                    <div>
                        <label className='block text-xs font-semibold text-crickbuzz-text mb-1.5'>
                            Phone Number
                        </label>
                        <input
                            type='tel'
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder='Enter your phone number'
                            className='w-full bg-white rounded-lg px-3 py-2 text-crickbuzz-text placeholder-crickbuzz-text-light focus:outline-none focus:ring-2 focus:ring-crickbuzz-green focus:ring-opacity-30 text-sm transition-all'
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className='block text-xs font-semibold text-crickbuzz-text mb-1.5'>
                            Password
                        </label>
                        <input
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='Enter your password'
                            className='w-full bg-white rounded-lg px-3 py-2 text-crickbuzz-text placeholder-crickbuzz-text-light focus:outline-none focus:ring-2 focus:ring-crickbuzz-green focus:ring-opacity-30 text-sm transition-all'
                        />
                    </div>

                    {/* Referral Code Input - Only for Register */}
                    {!isLogin && (
                        <div className='animate-slideDown'>
                            <label className='block text-xs font-semibold text-crickbuzz-text mb-1.5'>
                                Referral Code (Optional)
                            </label>
                            <input
                                type='text'
                                value={referralCode}
                                onChange={handleReferralCodeChange}
                                placeholder='Enter referral code'
                                className='w-full bg-white rounded-lg px-3 py-2 text-crickbuzz-text placeholder-crickbuzz-text-light focus:outline-none focus:ring-2 focus:ring-crickbuzz-green focus:ring-opacity-30 text-sm transition-all uppercase'
                                maxLength={20}
                            />
                            {verifyingReferral && (
                                <p className='text-xs text-crickbuzz-text-light mt-1'>Verifying...</p>
                            )}
                            {referrerName && (
                                <div className='mt-2 bg-green-50 border border-green-200 rounded-lg p-2'>
                                    <p className='text-xs text-green-700 font-medium'>
                                        ✓ Referred by: {referrerName}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Terms and Conditions - Only for Register */}
                    {!isLogin && (
                        <div className='animate-slideDown'>
                            <div className='flex items-start gap-2'>
                                <input
                                    type='checkbox'
                                    id='terms'
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className='mt-0.5 w-4 h-4 text-crickbuzz-green border-gray-300 rounded focus:ring-crickbuzz-green'
                                />
                                <label htmlFor='terms' className='text-xs text-crickbuzz-text-light flex-1'>
                                    I agree to the{' '}
                                    <button
                                        type='button'
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setShowTerms(true)
                                        }}
                                        className='text-crickbuzz-green font-semibold hover:underline'
                                    >
                                        Terms and Conditions
                                    </button>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className='bg-red-50 border border-red-200 rounded-lg p-2 animate-slideDown'>
                            <p className='text-xs text-red-600 font-medium'>{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button 
                        type='submit'
                        disabled={loading}
                        className='w-full bg-crickbuzz-green text-white font-bold py-2.5 rounded-lg transition-all hover:bg-crickbuzz-green-dark hover:shadow-lg active:scale-95 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
                    </button>
                </div>
            </form>

            {/* Additional Links */}
            <div className='mt-4 text-center'>
                <p className='text-xs text-crickbuzz-text-light'>
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button 
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setError('')
                            setAcceptedTerms(false)
                        }}
                        className='text-crickbuzz-green font-semibold hover:underline'
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </p>
            </div>

            {/* Terms and Conditions Modal */}
            {showTerms && (
                <div
                    className='fixed inset-0 bg-black bg-opacity-50 z-[100] flex flex-col justify-end overflow-hidden'
                    style={{
                        left: maxWidth === '420px' ? '50%' : '0',
                        right: maxWidth === '420px' ? 'auto' : '0',
                        width: maxWidth,
                        maxWidth: maxWidth,
                        transform: maxWidth === '420px' ? 'translateX(-50%)' : 'none',
                        marginLeft: maxWidth === '420px' ? '0' : 'auto',
                        marginRight: maxWidth === '420px' ? '0' : 'auto'
                    }}
                    onClick={() => setShowTerms(false)}
                >
                    <div
                        className='bg-white rounded-t-2xl overflow-y-auto shadow-xl mt-12 terms-modal'
                        style={{
                            width: '100%',
                            maxWidth: '100%',
                            maxHeight: 'calc(100vh - 3rem - 3.5rem)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className='sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm'>
                            <div className='p-3 flex items-center justify-between'>
                                <h3 className='text-sm font-bold text-crickbuzz-text'>Terms and Conditions</h3>
                                <button
                                    onClick={() => setShowTerms(false)}
                                    className='text-gray-500 hover:text-gray-700 text-xl leading-none p-1 flex-shrink-0'
                                >
                                    <IoClose />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className='p-4'>
                            <div className='text-xs text-crickbuzz-text-light space-y-4 leading-relaxed'>
                                <div>
                                    <h4 className='font-semibold text-crickbuzz-text mb-1.5'>1. Account Registration</h4>
                                    <p className='text-crickbuzz-text-light'>By creating an account, you agree to provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials.</p>
                                </div>
                                <div>
                                    <h4 className='font-semibold text-crickbuzz-text mb-1.5'>2. Wallet and Transactions</h4>
                                    <p className='text-crickbuzz-text-light'>All wallet transactions are subject to verification. Recharge requests require UTR (Unique Transaction Reference) for verification. Withdrawal requests are processed by admin after verification.</p>
                                </div>
                                <div>
                                    <h4 className='font-semibold text-crickbuzz-text mb-1.5'>3. Payment Verification</h4>
                                    <p className='text-crickbuzz-text-light'>After making a payment, you must provide the UTR number for verification. Payments without UTR may not be processed. Admin reserves the right to verify all transactions.</p>
                                </div>
                                <div>
                                    <h4 className='font-semibold text-crickbuzz-text mb-1.5'>4. Earnings and Rewards</h4>
                                    <p className='text-crickbuzz-text-light'>Earnings from click-to-earn and referral programs are subject to daily limits and verification. All earnings are credited to your wallet after verification.</p>
                                </div>
                                <div>
                                    <h4 className='font-semibold text-crickbuzz-text mb-1.5'>5. Account Restrictions</h4>
                                    <p className='text-crickbuzz-text-light'>We reserve the right to restrict or suspend accounts that violate our terms, engage in fraudulent activities, or misuse the platform.</p>
                                </div>
                                <div>
                                    <h4 className='font-semibold text-crickbuzz-text mb-1.5'>6. Refund Policy</h4>
                                    <p className='text-crickbuzz-text-light'>All transactions are final. Refunds are processed only in exceptional circumstances at the discretion of the admin.</p>
                                </div>
                                <div>
                                    <h4 className='font-semibold text-crickbuzz-text mb-1.5'>7. Limitation of Liability</h4>
                                    <p className='text-crickbuzz-text-light'>We are not responsible for any loss of funds if payment is not properly verified or if UTR is not provided. Users must ensure proper completion of payment processes.</p>
                                </div>
                                <div>
                                    <h4 className='font-semibold text-crickbuzz-text mb-1.5'>8. Changes to Terms</h4>
                                    <p className='text-crickbuzz-text-light'>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of modified terms.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className='sticky bottom-0 bg-white border-t border-gray-200 p-3 flex gap-2 shadow-lg'>
                            <button
                                onClick={() => setShowTerms(false)}
                                className='flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors text-xs font-semibold'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowTerms(false)
                                    setAcceptedTerms(true)
                                }}
                                className='flex-1 bg-crickbuzz-green text-white py-2 px-3 rounded-lg hover:bg-crickbuzz-green-dark transition-colors text-xs font-semibold'
                            >
                                Accept and Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    )
}

export default Login

