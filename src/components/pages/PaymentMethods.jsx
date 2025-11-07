import { useState, useEffect } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import { MdOutlinePayment, MdAccountBalance, MdCreditCard } from 'react-icons/md'
import { getPaymentMethod, savePaymentMethod } from '../../services/api'

function PaymentMethods({ user, setActiveTab, onBack }) {
    const [paymentMethod, setPaymentMethod] = useState({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: '',
        bankName: '',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [nextUpdateDate, setNextUpdateDate] = useState(null)
    const [canUpdate, setCanUpdate] = useState(true)

    useEffect(() => {
        if (user?.phone) {
            loadPaymentMethod()
        }
    }, [user])

    const loadPaymentMethod = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getPaymentMethod(user.phone)
            
            if (response.success) {
                if (response.data) {
                    setPaymentMethod({
                        accountHolderName: response.data.accountHolderName || '',
                        accountNumber: response.data.accountNumber || '',
                        ifscCode: response.data.ifscCode || '',
                        upiId: response.data.upiId || '',
                        bankName: response.data.bankName || '',
                    })
                    
                    // Check if user can update
                    const lastUpdated = new Date(response.data.lastUpdatedAt)
                    const now = new Date()
                    const daysSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60 * 24)
                    
                    if (daysSinceUpdate < 7) {
                        setCanUpdate(false)
                        const nextDate = new Date(lastUpdated)
                        nextDate.setDate(nextDate.getDate() + 7)
                        const day = nextDate.getDate()
                        const month = nextDate.getMonth() + 1
                        const year = nextDate.getFullYear()
                        setNextUpdateDate(`${day}/${month}/${year}`)
                    } else {
                        setCanUpdate(true)
                        setNextUpdateDate(null)
                    }
                }
            } else {
                setError(response.message || 'Failed to load payment method')
            }
        } catch (err) {
            console.error('Error loading payment method:', err)
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!paymentMethod.accountHolderName || !paymentMethod.accountNumber || !paymentMethod.ifscCode) {
            setError('Account holder name, account number, and IFSC code are required')
            return
        }

        if (!canUpdate) {
            setError(`You will be able to update it on ${nextUpdateDate}`)
            return
        }

        try {
            setSaving(true)
            setError(null)
            setSuccess(null)
            
            const response = await savePaymentMethod(user.phone, paymentMethod)
            
            if (response.success) {
                setSuccess('Payment method saved successfully!')
                setPaymentMethod(response.data)
                // Update canUpdate status
                const lastUpdated = new Date(response.data.lastUpdatedAt)
                const now = new Date()
                const daysSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60 * 24)
                
                if (daysSinceUpdate < 7) {
                    setCanUpdate(false)
                    const nextDate = new Date(lastUpdated)
                    nextDate.setDate(nextDate.getDate() + 7)
                    const day = nextDate.getDate()
                    const month = nextDate.getMonth() + 1
                    const year = nextDate.getFullYear()
                    setNextUpdateDate(`${day}/${month}/${year}`)
                } else {
                    setCanUpdate(true)
                }
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(null), 3000)
            } else {
                setError(response.message || 'Failed to save payment method')
                if (response.nextUpdateDate) {
                    setNextUpdateDate(response.nextUpdateDate)
                    setCanUpdate(false)
                }
            }
        } catch (err) {
            console.error('Error saving payment method:', err)
            setError('Network error. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleBackClick = () => {
        if (onBack) {
            onBack()
        } else if (setActiveTab) {
            setActiveTab('account')
        }
    }

    if (loading) {
        return (
            <div className='flex flex-col px-4 py-4 pb-20'>
                <div className='text-center py-8'>
                    <p className='text-sm text-crickbuzz-text-light'>Loading payment method...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-col px-4 py-4 pb-20'>
            {/* Back Button */}
            <button
                onClick={handleBackClick}
                className='flex items-center gap-2 mb-4 text-crickbuzz-text hover:text-crickbuzz-green transition-colors'
            >
                <IoArrowBack className='text-lg' />
                <span className='text-sm font-semibold'>Back</span>
            </button>

            {/* Header */}
            <div className='mb-4'>
                <h2 className='text-2xl font-bold text-crickbuzz-text mb-1'>Payment Methods</h2>
                <p className='text-xs text-crickbuzz-text-light'>Manage your account details for withdrawals</p>
            </div>

            {/* Update Restriction Notice */}
            {!canUpdate && nextUpdateDate && (
                <div className='bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4'>
                    <p className='text-xs text-amber-700 font-semibold mb-1'>Update Restriction</p>
                    <p className='text-xs text-amber-600'>
                        You will be able to update it on {nextUpdateDate}
                    </p>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className='bg-green-50 border border-green-200 rounded-lg p-3 mb-4'>
                    <p className='text-xs text-green-700'>{success}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-3 mb-4'>
                    <p className='text-xs text-red-600'>{error}</p>
                </div>
            )}

            {/* Payment Method Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
                {/* Account Holder Name */}
                <div>
                    <label className='block text-xs font-semibold text-crickbuzz-text mb-1.5 flex items-center gap-1.5'>
                        <MdAccountBalance className='text-base' />
                        Account Holder Name
                    </label>
                    <input
                        type='text'
                        value={paymentMethod.accountHolderName}
                        onChange={(e) => setPaymentMethod({ ...paymentMethod, accountHolderName: e.target.value })}
                        placeholder='Enter account holder name'
                        disabled={!canUpdate}
                        required
                        className='w-full px-3 py-2.5 rounded-lg border border-crickbuzz-border bg-white text-sm text-crickbuzz-text focus:outline-none focus:ring-2 focus:ring-crickbuzz-green focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
                    />
                </div>

                {/* Account Number */}
                <div>
                    <label className='block text-xs font-semibold text-crickbuzz-text mb-1.5 flex items-center gap-1.5'>
                        <MdCreditCard className='text-base' />
                        Account Number
                    </label>
                    <input
                        type='text'
                        value={paymentMethod.accountNumber}
                        onChange={(e) => setPaymentMethod({ ...paymentMethod, accountNumber: e.target.value.replace(/\D/g, '') })}
                        placeholder='Enter account number'
                        disabled={!canUpdate}
                        required
                        className='w-full px-3 py-2.5 rounded-lg border border-crickbuzz-border bg-white text-sm text-crickbuzz-text focus:outline-none focus:ring-2 focus:ring-crickbuzz-green focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
                    />
                </div>

                {/* IFSC Code */}
                <div>
                    <label className='block text-xs font-semibold text-crickbuzz-text mb-1.5 flex items-center gap-1.5'>
                        <MdOutlinePayment className='text-base' />
                        IFSC Code
                    </label>
                    <input
                        type='text'
                        value={paymentMethod.ifscCode}
                        onChange={(e) => setPaymentMethod({ ...paymentMethod, ifscCode: e.target.value.toUpperCase().replace(/\s/g, '') })}
                        placeholder='Enter IFSC code'
                        disabled={!canUpdate}
                        required
                        maxLength={11}
                        className='w-full px-3 py-2.5 rounded-lg border border-crickbuzz-border bg-white text-sm text-crickbuzz-text focus:outline-none focus:ring-2 focus:ring-crickbuzz-green focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono'
                    />
                </div>

                {/* Bank Name (Optional) */}
                <div>
                    <label className='block text-xs font-semibold text-crickbuzz-text mb-1.5'>
                        Bank Name (Optional)
                    </label>
                    <input
                        type='text'
                        value={paymentMethod.bankName}
                        onChange={(e) => setPaymentMethod({ ...paymentMethod, bankName: e.target.value })}
                        placeholder='Enter bank name'
                        disabled={!canUpdate}
                        className='w-full px-3 py-2.5 rounded-lg border border-crickbuzz-border bg-white text-sm text-crickbuzz-text focus:outline-none focus:ring-2 focus:ring-crickbuzz-green focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
                    />
                </div>

                {/* UPI ID (Optional) */}
                <div>
                    <label className='block text-xs font-semibold text-crickbuzz-text mb-1.5'>
                        UPI ID (Optional)
                    </label>
                    <input
                        type='text'
                        value={paymentMethod.upiId}
                        onChange={(e) => setPaymentMethod({ ...paymentMethod, upiId: e.target.value.toLowerCase().replace(/\s/g, '') })}
                        placeholder='Enter UPI ID (e.g., name@paytm)'
                        disabled={!canUpdate}
                        className='w-full px-3 py-2.5 rounded-lg border border-crickbuzz-border bg-white text-sm text-crickbuzz-text focus:outline-none focus:ring-2 focus:ring-crickbuzz-green focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono'
                    />
                </div>

                {/* Submit Button */}
                <button
                    type='submit'
                    disabled={!canUpdate || saving}
                    className='w-full bg-crickbuzz-green text-white font-bold py-3 rounded-lg hover:bg-crickbuzz-green-dark transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                    {saving ? (
                        <>
                            <span className='animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full'></span>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <MdOutlinePayment className='text-base' />
                            <span>{paymentMethod.accountHolderName ? 'Update' : 'Save'} Payment Method</span>
                        </>
                    )}
                </button>
            </form>

            {/* Info Card */}
            <div className='mt-4 bg-crickbuzz-light rounded-lg p-3'>
                <p className='text-xs text-crickbuzz-text-light leading-relaxed'>
                    <strong className='text-crickbuzz-text'>Note:</strong> You can update your payment method once per week. 
                    This information is used by admin to process your withdrawal requests.
                </p>
            </div>
        </div>
    )
}

export default PaymentMethods

