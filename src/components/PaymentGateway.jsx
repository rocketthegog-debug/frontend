import { QRCodeSVG } from 'qrcode.react'
import { APP_CONFIG } from '../config'
import { IoClose } from 'react-icons/io5'
import { useMemo } from 'react'

function PaymentGateway({ amount, onClose, onPaymentInitiated }) {
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

    // UPI deep link to open payment apps
    const upiDeepLink = `upi://pay?pa=${selectedUpiId}&pn=${APP_CONFIG.merchantName}&am=${amount}&cu=INR`

    const handleOpenUPI = () => {
        // Backend will generate transaction ID and UPI reference ID
        onPaymentInitiated(amount, 'upi', null)
        window.location.href = upiDeepLink
        onClose()
    }

    const handleIHavePaid = () => {
        // Backend will generate transaction ID and UPI reference ID
        onPaymentInitiated(amount, 'paid', null)
        onClose()
    }

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4'>
            <div className='bg-white rounded-lg p-4 w-full max-w-xs relative shadow-xl'>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className='absolute top-2 right-2 text-crickbuzz-text-light hover:text-crickbuzz-text transition-colors'
                >
                    <IoClose className='text-lg' />
                </button>

                {/* Compact Header */}
                <div className='text-center mb-3'>
                    <h3 className='text-base font-bold text-crickbuzz-text'>Pay {APP_CONFIG.currency}{amount}</h3>
                </div>

                {/* QR Code with Logo */}
                <div className='bg-white p-3 rounded-lg mb-3 flex justify-center'>
                    <div className='relative inline-block'>
                        <QRCodeSVG
                            value={upiPaymentString}
                            size={180}
                            level='H'
                            includeMargin={true}
                            bgColor="#FFFFFF"
                            fgColor="#000000"
                            imageSettings={{
                                src: APP_CONFIG.logoPath,
                                height: 35,
                                width: 35,
                                excavate: true, // Makes QR code work around the logo
                            }}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <button
                    onClick={handleOpenUPI}
                    className='w-full bg-crickbuzz-green text-white font-bold py-2.5 rounded-lg hover:bg-crickbuzz-green-dark transition-colors text-sm mb-2'
                >
                    Pay with UPI Apps
                </button>
                
                {/* I've Paid - UTR Matching */}
                <button
                    onClick={handleIHavePaid}
                    className='w-full bg-crickbuzz-light text-crickbuzz-text font-semibold py-2.5 rounded-lg hover:bg-crickbuzz-green hover:text-white transition-colors text-sm'
                >
                    I've Paid
                </button>
            </div>
        </div>
    )
}

export default PaymentGateway

