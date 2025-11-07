import { useState, useEffect } from 'react'
import { APP_CONFIG } from '../../config'
import { createWithdrawal } from '../../services/api'
import { IoWalletOutline } from 'react-icons/io5'
import Alert from '../Alert'

function Withdrawal({ user, walletBalance, refreshWalletBalance, setActiveTab }) {
    const [amount, setAmount] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [alert, setAlert] = useState({ isOpen: false, type: 'info', message: '' })

    const showAlert = (type, message) => {
        setAlert({ isOpen: true, type, message })
    }

    const handleAmountChange = (e) => {
        const value = e.target.value
        
        // Only allow numbers
        if (value === '' || /^\d+$/.test(value)) {
            setAmount(value)
            setError('')
            
            // Validate only if value is not empty
            if (value !== '') {
                const numValue = parseInt(value)
                
                // Check minimum
                if (numValue < 100) {
                    setError('Minimum withdrawal amount is ₹100')
                    return
                }
                
                // Check if sufficient balance
                if (numValue > walletBalance) {
                    setError('Insufficient balance')
                    return
                }
                
                // Check multiple of 10
                if (numValue % 10 !== 0) {
                    setError('Amount must be a multiple of 10')
                    return
                }
            }
        }
    }

    const handleWithdraw = async () => {
        const numAmount = parseInt(amount)
        
        // Final validation
        if (!amount || amount === '') {
            setError('Please enter an amount')
            return
        }
        
        if (numAmount < 100) {
            setError('Minimum withdrawal amount is ₹100')
            return
        }
        
        if (numAmount > walletBalance) {
            setError('Insufficient balance')
            return
        }
        
        if (numAmount % 10 !== 0) {
            setError('Amount must be a multiple of 10')
            return
        }

        if (!user?.phone) {
            setError('User not authenticated')
            return
        }

        try {
            setLoading(true)
            setError('')
            setSuccess(false)

            // Create withdrawal request in backend with "processing" status
            const response = await createWithdrawal(user.phone, numAmount)

            if (response.success) {
                setSuccess(true)
                setAmount('')
                
                // Refresh wallet balance
                if (refreshWalletBalance) {
                    await refreshWalletBalance()
                }
                
                showAlert('success', `Withdrawal request submitted successfully!\n\nAmount: ${APP_CONFIG.currency}${numAmount}\n\nAdmin will process your withdrawal request.`)
            } else {
                setError(response.message || 'Failed to create withdrawal request')
            }
        } catch (err) {
            console.error('Error creating withdrawal:', err)
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Redirect to login if not logged in
    useEffect(() => {
        if (!user && setActiveTab) {
            setActiveTab('account')
        }
    }, [user, setActiveTab])

    // If not logged in, don't render anything (redirect will happen)
    if (!user) {
        return null
    }

    return (
        <div className='flex flex-col py-4 px-4 pb-20'>
            {/* Compact Header */}
            <h2 className='text-2xl font-bold text-crickbuzz-text mb-3'>Withdraw</h2>
            
            {/* Wallet Balance Card */}
            <div className='bg-crickbuzz-green text-white rounded-lg p-3 mb-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <IoWalletOutline className='text-xl' />
                        <div>
                            <p className='text-xs opacity-90 mb-0.5'>Available Balance</p>
                            <p className='text-xl font-bold'>{APP_CONFIG.currency} {walletBalance.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Card */}
            <div className='bg-crickbuzz-light rounded-lg p-3 mb-3'>
                <label className='block text-xs font-semibold text-crickbuzz-text mb-2'>
                    Enter Withdrawal Amount <span className='text-crickbuzz-text-light font-normal'>(Min ₹100, Multiple of 10)</span>
                </label>
                <input
                    type='text'
                    inputMode='numeric'
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder={`${APP_CONFIG.currency} 0`}
                    className={`w-full bg-white rounded-lg px-3 py-2 text-crickbuzz-text placeholder-crickbuzz-text-light focus:outline-none focus:ring-2 focus:ring-opacity-30 text-sm transition-all ${
                        error ? 'focus:ring-red-500 border border-red-200' : 'focus:ring-crickbuzz-green'
                    }`}
                />
                {error && (
                    <p className='text-xs text-red-600 font-medium mt-2'>{error}</p>
                )}
                {success && (
                    <p className='text-xs text-green-600 font-medium mt-2'>Withdrawal request submitted successfully!</p>
                )}
            </div>

            {/* Info Card */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4'>
                <p className='text-xs font-semibold text-blue-900 mb-1'>Withdrawal Process:</p>
                <ul className='text-xs text-blue-800 space-y-1 list-disc list-inside'>
                    <li>Request will be reviewed by admin</li>
                    <li>Processing may take 24-48 hours</li>
                    <li>Funds will be deducted only after admin confirmation</li>
                </ul>
            </div>

            {/* Withdraw Button */}
            <button 
                onClick={handleWithdraw}
                disabled={loading || !amount || error !== '' || (amount && (parseInt(amount) < 100 || parseInt(amount) % 10 !== 0 || parseInt(amount) > walletBalance))}
                className={`w-full font-bold py-2.5 rounded-lg transition-colors text-sm ${
                    loading || !amount || error !== '' || (amount && (parseInt(amount) < 100 || parseInt(amount) % 10 !== 0 || parseInt(amount) > walletBalance))
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
            >
                {loading ? 'Processing...' : `Withdraw ${APP_CONFIG.currency}${amount || '0'}`}
            </button>

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

export default Withdrawal

