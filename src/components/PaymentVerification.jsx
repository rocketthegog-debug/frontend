import { useRef, useState } from 'react'
import { APP_CONFIG } from '../config'
import { IoClose, IoShareSocialOutline } from 'react-icons/io5'
import Alert from './Alert'

function PaymentVerification({ amount, onPaymentSubmitted, onCancel, paymentType, transaction }) {
    const modalRef = useRef(null)
    const [alert, setAlert] = useState({ isOpen: false, type: 'info', message: '' })

    const showAlert = (type, message) => {
        setAlert({ isOpen: true, type, message })
    }

    const handleSaveAndShare = async () => {
        try {
            // Import html2canvas dynamically
            const html2canvas = (await import('html2canvas')).default
            
            if (!modalRef.current) return

            // Capture the modal as image
            const canvas = await html2canvas(modalRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true
            })

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (!blob) return

                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `payment-request-${Date.now()}.png`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)

                // Try to share via Web Share API
                if (navigator.share && navigator.canShare) {
                    const file = new File([blob], `payment-request-${Date.now()}.png`, { type: 'image/png' })
                    if (navigator.canShare({ files: [file] })) {
                        navigator.share({
                            files: [file],
                            title: 'Payment Request',
                            text: `Payment Request for ${APP_CONFIG.currency}${amount}`
                        }).then(() => {
                            // Notify parent component
                            if (onPaymentSubmitted) {
                                onPaymentSubmitted()
                            }
                        }).catch(() => {
                            // Fallback: user cancelled or share failed
                            // Still notify parent since download happened
                            if (onPaymentSubmitted) {
                                onPaymentSubmitted()
                            }
                        })
                    } else {
                        // Share not available, but download completed
                        if (onPaymentSubmitted) {
                            onPaymentSubmitted()
                        }
                    }
                } else {
                    // Web Share API not available, but download completed
                    if (onPaymentSubmitted) {
                        onPaymentSubmitted()
                    }
                }
            }, 'image/png')
        } catch (error) {
            console.error('Error generating image:', error)
            showAlert('error', 'Failed to generate image. Please try again.')
        }
    }

    return (
        <>
            <div className='fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4'>
            <div ref={modalRef} className='bg-white rounded-lg p-4 w-full max-w-xs relative shadow-xl'>
                {/* Close Button - Top Right */}
                <button
                    onClick={onCancel}
                    className='absolute top-2 right-2 text-crickbuzz-text-light hover:text-crickbuzz-text transition-colors z-10'
                >
                    <IoClose className='text-xl' />
                </button>

                <div className='text-center'>
                    {/* Header */}
                    <h3 className='text-base font-bold text-crickbuzz-text mb-2'>
                        Payment Request
                    </h3>

                    <p className='text-xs text-crickbuzz-text-light mb-4'>
                        Please complete your payment and share this request for verification.
                    </p>


                    {/* Payment Info */}
                    <div className='bg-crickbuzz-light rounded-lg p-3 mb-3'>
                        <p className='text-xs text-crickbuzz-text-light mb-1'>Amount to Pay</p>
                        <p className='text-xl font-bold text-crickbuzz-text'>{APP_CONFIG.currency} {amount}</p>
                        {transaction?._id && (
                            <div className='mt-2 pt-2 border-t border-gray-300'>
                                <p className='text-xs text-crickbuzz-text-light mb-1'>Transaction ID</p>
                                <p className='text-xs font-bold text-crickbuzz-text font-mono break-all'>{transaction._id}</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className='space-y-2'>
                        <button
                            onClick={handleSaveAndShare}
                            className='w-full bg-crickbuzz-green text-white font-bold py-2.5 rounded-lg hover:bg-crickbuzz-green-dark transition-colors text-sm flex items-center justify-center gap-2'
                        >
                            <IoShareSocialOutline className='text-base' />
                            <span>Save & Share</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Alert Component */}
            <Alert
                isOpen={alert.isOpen}
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ ...alert, isOpen: false })}
            />
        </>
    )
}

export default PaymentVerification
