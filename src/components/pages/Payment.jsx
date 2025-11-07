import { useMemo, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { APP_CONFIG } from '../../config'
import { IoArrowBack } from 'react-icons/io5'

function Payment({ user, amount, transaction, onClose, setActiveTab }) {
    // Redirect if no user or amount
    useEffect(() => {
        if (!user || !amount) {
            if (setActiveTab) {
                setActiveTab('recharge')
            }
        }
    }, [user, amount, setActiveTab])

    // Randomly select a UPI ID from the array
    const selectedUpiId = useMemo(() => {
        const upiIds = APP_CONFIG.upiIds || []
        if (upiIds.length === 0) {
            return 'crickbuzz@sbi' // Fallback
        }
        const randomIndex = Math.floor(Math.random() * upiIds.length)
        return upiIds[randomIndex]
    }, [])

    // Generate UPI payment string
    const upiPaymentString = `upi://pay?pa=${selectedUpiId}&pn=${APP_CONFIG.merchantName}&am=${amount}&cu=INR&tn=Recharge%20${APP_CONFIG.currency}${amount}`

    const handleBack = () => {
        // Navigate back to recharge page
        // The transaction is already created, so it will be visible in My Orders
        if (setActiveTab) {
            setActiveTab('recharge')
        }
        if (onClose) {
            onClose()
        }
    }

    // Don't render if no user or amount
    if (!user || !amount) {
        return null
    }

    return (
        <div className='flex flex-col px-4 py-4 pb-20'>
            {/* Back Button */}
            <button
                onClick={handleBack}
                className='flex items-center gap-2 mb-4 text-crickbuzz-text hover:text-crickbuzz-green transition-colors'
            >
                <IoArrowBack className='text-lg' />
                <span className='text-sm font-semibold'>Back</span>
            </button>

            {/* Header */}
            <div className='text-center mb-4'>
                <h2 className='text-2xl font-bold text-crickbuzz-text mb-1'>Payment</h2>
                <p className='text-xs text-crickbuzz-text-light'>Scan QR code to complete payment</p>
                <div className='mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2'>
                    <p className='text-xs text-blue-700 font-medium'>
                        ✓ Recharge request created. After payment, provide UTR in "My Orders" for verification.
                    </p>
                </div>
            </div>

            {/* QR Code - On Top */}
            <div className='bg-white p-4 rounded-lg mb-4 flex justify-center'>
                <div className='relative inline-block'>
                    <QRCodeSVG
                        value={upiPaymentString}
                        size={240}
                        level='H'
                        includeMargin={true}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        imageSettings={{
                            src: APP_CONFIG.logoPath,
                            height: 40,
                            width: 40,
                            excavate: true,
                        }}
                    />
                </div>
            </div>

            {/* User Info Card - Below QR */}
            <div className='bg-crickbuzz-light rounded-lg p-4 mb-4'>
                <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                        <p className='text-xs text-crickbuzz-text-light'>User Name</p>
                        <p className='text-sm font-bold text-crickbuzz-text'>{user?.name || 'N/A'}</p>
                    </div>
                    <div className='flex items-center justify-between'>
                        <p className='text-xs text-crickbuzz-text-light'>User ID</p>
                        <p className='text-sm font-bold text-crickbuzz-text font-mono'>{user?.phone || 'N/A'}</p>
                    </div>
                    <div className='flex items-center justify-between'>
                        <p className='text-xs text-crickbuzz-text-light'>Amount</p>
                        <p className='text-lg font-bold text-crickbuzz-green'>{APP_CONFIG.currency} {amount}</p>
                    </div>
                    {transaction?._id && (
                        <div className='flex items-center justify-between pt-2 border-t border-gray-300'>
                            <p className='text-xs text-crickbuzz-text-light'>Transaction ID</p>
                            <p className='text-xs font-bold text-crickbuzz-text font-mono'>{transaction._id}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pay with UPI Apps Button */}
            <button
                onClick={() => {
                    const upiDeepLink = `upi://pay?pa=${selectedUpiId}&pn=${APP_CONFIG.merchantName}&am=${amount}&cu=INR`
                    window.location.href = upiDeepLink
                }}
                className='w-full bg-crickbuzz-light text-crickbuzz-text font-semibold py-2.5 rounded-lg hover:bg-crickbuzz-green hover:text-white transition-colors text-sm mb-4 flex items-center justify-center gap-2'
            >
                <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <rect x='2' y='6' width='20' height='12' rx='2' stroke='currentColor' strokeWidth='2' fill='none'/>
                    <path d='M7 10H17M7 14H14' stroke='currentColor' strokeWidth='2' strokeLinecap='round'/>
                </svg>
                <span>Pay with UPI Apps</span>
                <svg className='w-4 h-4' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M5 12H19M19 12L12 5M19 12L12 19' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                </svg>
            </button>

            {/* Done Button */}
            <button
                onClick={handleBack}
                className='w-full bg-crickbuzz-green text-white font-bold py-3 rounded-lg hover:bg-crickbuzz-green-dark transition-colors text-sm mb-3 flex items-center justify-center gap-2'
            >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'/>
                </svg>
                <span>Done</span>
            </button>

            {/* Important Notice */}
            <div className='mt-auto pt-4'>
                <div className='bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2'>
                    <p className='text-xs text-amber-800 font-semibold mb-1'>Important:</p>
                    <p className='text-[10px] text-amber-700 leading-relaxed'>
                        1. Your recharge request is already created and visible in "My Orders"<br/>
                        2. After payment, go to "My Orders" and add your UTR number<br/>
                        3. Admin will verify and complete your recharge after UTR verification
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Payment

