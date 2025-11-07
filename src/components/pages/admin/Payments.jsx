import { useState, useEffect } from 'react'
import { APP_CONFIG } from '../../../config'
import { IoArrowUpOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline } from 'react-icons/io5'
import Alert from '../../Alert'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

function AdminPayments({ user, refreshWalletBalance }) {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [processing, setProcessing] = useState(null)
    const [alert, setAlert] = useState({ isOpen: false, type: 'info', message: '' })

    const showAlert = (type, message) => {
        setAlert({ isOpen: true, type, message })
    }

    useEffect(() => {
        loadTransactions()
    }, [])

    const loadTransactions = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch(`${API_BASE_URL}/admin/transactions?status=processing&paymentType=recharge`)
            const data = await response.json()
            
            if (data.success) {
                setTransactions(data.data || [])
            } else {
                setError(data.message || 'Failed to load transactions')
            }
        } catch (err) {
            console.error('Error loading transactions:', err)
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const updateTransactionStatus = async (transactionId, status) => {
        if (!user?.phone) return
        
        try {
            setProcessing(transactionId)
            const response = await fetch(`${API_BASE_URL}/admin/transactions/${transactionId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    adminUserId: user.phone
                })
            })
            
            const data = await response.json()
            
            if (data.success) {
                await loadTransactions()
                if (refreshWalletBalance) {
                    refreshWalletBalance()
                }
                showAlert('success', `Payment ${status === 'completed' ? 'verified and approved' : 'cancelled'} successfully!`)
            } else {
                showAlert('error', data.message || 'Failed to update transaction')
            }
        } catch (err) {
            console.error('Error updating transaction:', err)
            showAlert('error', 'Network error. Please try again.')
        } finally {
            setProcessing(null)
        }
    }

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        } catch {
            return dateString
        }
    }

    return (
        <div className='flex flex-col py-4 px-4 pb-20'>
            <div className='flex items-center justify-between mb-4'>
                <h2 className='text-2xl font-bold text-crickbuzz-text'>Payments</h2>
                <button
                    onClick={loadTransactions}
                    className='text-xs text-crickbuzz-green font-semibold hover:underline'
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className='text-center py-8'>
                    <p className='text-sm text-crickbuzz-text-light'>Loading payments...</p>
                </div>
            ) : error ? (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-center'>
                    <p className='text-xs text-red-600'>{error}</p>
                </div>
            ) : transactions.length === 0 ? (
                <div className='bg-crickbuzz-light rounded-lg p-8 text-center'>
                    <p className='text-sm text-crickbuzz-text-light'>No pending payments</p>
                </div>
            ) : (
                <div className='space-y-2'>
                    {transactions.map((tx) => (
                        <div key={tx._id} className='bg-crickbuzz-light rounded-lg p-3 border border-gray-200'>
                            <div className='flex items-center justify-between mb-2'>
                                <div className='flex items-center gap-2'>
                                    <div className='bg-crickbuzz-green rounded-full p-1.5'>
                                        <IoArrowUpOutline className='text-white text-xs' />
                                    </div>
                                    <div>
                                        <p className='text-xs font-semibold text-crickbuzz-text'>Recharge Request</p>
                                        <p className='text-xs text-crickbuzz-text-light'>{formatDate(tx.createdAt)}</p>
                                    </div>
                                </div>
                                <p className='text-sm font-bold text-crickbuzz-green'>
                                    +{APP_CONFIG.currency}{tx.amount}
                                </p>
                            </div>
                            
                            <div className='grid grid-cols-2 gap-2 mb-2 text-xs'>
                                <div>
                                    <p className='text-crickbuzz-text-light mb-0.5'>User ID</p>
                                    <p className='font-semibold text-crickbuzz-text'>{tx.userId}</p>
                                </div>
                                <div>
                                    <p className='text-crickbuzz-text-light mb-0.5'>TX ID</p>
                                    <p className='font-mono text-xs text-crickbuzz-text'>{tx._id}</p>
                                </div>
                            </div>
                            
                            {tx.utr && (
                                <div className='mb-2 text-xs'>
                                    <p className='text-crickbuzz-text-light mb-0.5'>UTR</p>
                                    <p className='font-mono text-crickbuzz-text'>{tx.utr}</p>
                                </div>
                            )}
                            
                            {tx.upiReferenceId && (
                                <div className='mb-2 text-xs'>
                                    <p className='text-crickbuzz-text-light mb-0.5'>UPI Ref ID</p>
                                    <p className='font-mono text-xs text-crickbuzz-text'>{tx.upiReferenceId}</p>
                                </div>
                            )}

                            <div className='flex gap-2 mt-3'>
                                <button
                                    onClick={() => updateTransactionStatus(tx._id, 'completed')}
                                    disabled={processing === tx._id}
                                    className='flex-1 bg-crickbuzz-green text-white rounded-lg py-2 px-3 flex items-center justify-center gap-1.5 hover:bg-crickbuzz-green-dark transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    <IoCheckmarkCircleOutline className='text-base' />
                                    Verify & Approve
                                </button>
                                <button
                                    onClick={() => updateTransactionStatus(tx._id, 'cancelled')}
                                    disabled={processing === tx._id}
                                    className='flex-1 bg-red-500 text-white rounded-lg py-2 px-3 flex items-center justify-center gap-1.5 hover:bg-red-600 transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    <IoCloseCircleOutline className='text-base' />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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

export default AdminPayments

