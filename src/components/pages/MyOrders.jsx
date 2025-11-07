import { useState, useEffect } from 'react'
import { APP_CONFIG } from '../../config'
import { getUserTransactions, updateRechargeUTR } from '../../services/api'
import { IoArrowBack, IoArrowUpOutline, IoArrowDownOutline } from 'react-icons/io5'
import Alert from '../Alert'

function MyOrders({ user, setActiveTab, onBack }) {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // 'all', 'recharge', 'withdrawal'
    const [editingUTR, setEditingUTR] = useState(null) // { transactionId, utr }
    const [savingUTR, setSavingUTR] = useState(false)
    const [alert, setAlert] = useState({ isOpen: false, type: 'info', message: '' })

    useEffect(() => {
        if (user?.phone) {
            loadTransactions()
        }
    }, [user, filter])

    const loadTransactions = async () => {
        if (!user?.phone) return
        try {
            setLoading(true)
            let response

            if (filter === 'all') {
                // Get all transactions
                response = await getUserTransactions(user.phone)
            } else {
                // Get filtered transactions
                response = await getUserTransactions(user.phone, null, filter)
            }

            if (response.success) {
                // Sort by date (newest first) and limit to recent 50
                const sorted = (response.data || [])
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 50)
                setTransactions(sorted)
            }
        } catch (error) {
            console.error('Error loading transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString)
            const now = new Date()
            const diffTime = Math.abs(now - date)
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays === 0) {
                const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
                if (diffHours === 0) {
                    const diffMinutes = Math.floor(diffTime / (1000 * 60))
                    return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`
                }
                return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
            } else if (diffDays === 1) {
                return 'Yesterday'
            } else if (diffDays < 7) {
                return `${diffDays} days ago`
            } else {
                return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
            }
        } catch {
            return dateString
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-50'
            case 'processing':
            case 'pending':
                return 'text-amber-600 bg-amber-50'
            case 'cancelled':
            case 'failed':
                return 'text-red-600 bg-red-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    const getPaymentTypeLabel = (paymentType) => {
        switch (paymentType) {
            case 'recharge':
                return 'Recharge'
            case 'withdrawal':
                return 'Withdrawal'
            case 'click-earn':
                return 'Click Earn'
            case 'order':
                return 'Order'
            default:
                return paymentType.charAt(0).toUpperCase() + paymentType.slice(1)
        }
    }

    const isPositiveTransaction = (paymentType) => {
        return paymentType === 'recharge' || paymentType === 'click-earn' || paymentType === 'order'
    }

    const showAlert = (type, message) => {
        setAlert({ isOpen: true, type, message })
    }

    const handleAddUTR = (tx) => {
        setEditingUTR({
            transactionId: tx._id,
            utr: tx.utr || ''
        })
    }

    const handleSaveUTR = async () => {
        if (!editingUTR || !editingUTR.utr.trim()) {
            showAlert('error', 'Please enter a valid UTR number')
            return
        }

        try {
            setSavingUTR(true)
            const response = await updateRechargeUTR(editingUTR.transactionId, editingUTR.utr.trim())
            
            if (response.success) {
                showAlert('success', 'UTR added successfully. Admin will verify your payment.')
                // Reload transactions
                await loadTransactions()
                setEditingUTR(null)
            } else {
                showAlert('error', response.message || 'Failed to update UTR')
            }
        } catch (error) {
            console.error('Error updating UTR:', error)
            showAlert('error', 'Failed to update UTR. Please try again.')
        } finally {
            setSavingUTR(false)
        }
    }

    const handleCancelUTR = () => {
        setEditingUTR(null)
    }

    const handleBackClick = () => {
        if (onBack) {
            onBack()
        } else if (setActiveTab) {
            setActiveTab('account')
        }
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
                <h2 className='text-2xl font-bold text-crickbuzz-text mb-1'>My Orders</h2>
                <p className='text-xs text-crickbuzz-text-light'>View all your transactions</p>
            </div>

            {/* Filter Buttons */}
            <div className='flex gap-2 mb-4'>
                <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                        filter === 'all'
                            ? 'bg-crickbuzz-green text-white'
                            : 'bg-crickbuzz-light text-crickbuzz-text hover:bg-gray-200'
                    }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('recharge')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                        filter === 'recharge'
                            ? 'bg-crickbuzz-green text-white'
                            : 'bg-crickbuzz-light text-crickbuzz-text hover:bg-gray-200'
                    }`}
                >
                    Recharges
                </button>
                <button
                    onClick={() => setFilter('withdrawal')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                        filter === 'withdrawal'
                            ? 'bg-crickbuzz-green text-white'
                            : 'bg-crickbuzz-light text-crickbuzz-text hover:bg-gray-200'
                    }`}
                >
                    Withdrawals
                </button>
            </div>

            {/* Transactions List */}
            {loading ? (
                <div className='text-center py-8'>
                    <p className='text-sm text-crickbuzz-text-light'>Loading transactions...</p>
                </div>
            ) : transactions.length === 0 ? (
                <div className='bg-crickbuzz-light rounded-lg p-8 text-center'>
                    <p className='text-sm text-crickbuzz-text-light'>No transactions found</p>
                </div>
            ) : (
                <div className='space-y-2'>
                    {transactions.map((tx) => (
                        <div key={tx._id} className='bg-crickbuzz-light rounded-lg p-3 border border-gray-200'>
                            <div className='flex items-center justify-between mb-2'>
                                <div className='flex items-center gap-2'>
                                    <div className={`rounded-full p-1.5 ${
                                        isPositiveTransaction(tx.paymentType)
                                            ? 'bg-crickbuzz-green'
                                            : 'bg-amber-500'
                                    }`}>
                                        {isPositiveTransaction(tx.paymentType) ? (
                                            <IoArrowUpOutline className='text-white text-xs' />
                                        ) : (
                                            <IoArrowDownOutline className='text-white text-xs' />
                                        )}
                                    </div>
                                    <div>
                                        <p className='text-xs font-semibold text-crickbuzz-text'>
                                            {getPaymentTypeLabel(tx.paymentType)}
                                        </p>
                                        <p className='text-xs text-crickbuzz-text-light'>{formatDate(tx.createdAt)}</p>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <p className={`text-sm font-bold ${
                                        isPositiveTransaction(tx.paymentType)
                                            ? 'text-crickbuzz-green'
                                            : 'text-amber-600'
                                    }`}>
                                        {isPositiveTransaction(tx.paymentType) ? '+' : '-'}{APP_CONFIG.currency}{tx.amount}
                                    </p>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${getStatusColor(tx.status)}`}>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>
                            
                            {/* UTR Section for Recharge Transactions */}
                            {tx.paymentType === 'recharge' && tx.status === 'processing' && (
                                <div className='mt-3 pt-3 border-t border-gray-300'>
                                    {editingUTR?.transactionId === tx._id ? (
                                        <div className='space-y-2'>
                                            <div>
                                                <label className='block text-xs font-semibold text-crickbuzz-text mb-1'>
                                                    UTR Number
                                                </label>
                                                <input
                                                    type='text'
                                                    value={editingUTR.utr}
                                                    onChange={(e) => setEditingUTR({ ...editingUTR, utr: e.target.value })}
                                                    placeholder='Enter UTR from payment receipt'
                                                    className='w-full bg-white rounded-lg px-3 py-2 text-xs text-crickbuzz-text placeholder-crickbuzz-text-light focus:outline-none focus:ring-2 focus:ring-crickbuzz-green border border-gray-300'
                                                />
                                            </div>
                                            <div className='flex gap-2'>
                                                <button
                                                    onClick={handleSaveUTR}
                                                    disabled={savingUTR || !editingUTR.utr.trim()}
                                                    className='flex-1 bg-crickbuzz-green text-white py-1.5 px-3 rounded-lg text-xs font-semibold hover:bg-crickbuzz-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                                >
                                                    {savingUTR ? 'Saving...' : 'Save UTR'}
                                                </button>
                                                <button
                                                    onClick={handleCancelUTR}
                                                    disabled={savingUTR}
                                                    className='flex-1 bg-gray-200 text-gray-700 py-1.5 px-3 rounded-lg text-xs font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50'
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {tx.utr ? (
                                                <div className='flex items-center justify-between'>
                                                    <div>
                                                        <p className='text-xs text-crickbuzz-text-light'>UTR:</p>
                                                        <p className='text-xs font-mono text-crickbuzz-text font-semibold'>{tx.utr}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddUTR(tx)}
                                                        className='text-xs text-crickbuzz-green font-semibold hover:underline'
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className='text-xs text-amber-700 mb-2 font-medium'>
                                                        ⚠️ Add UTR number to verify your payment
                                                    </p>
                                                    <button
                                                        onClick={() => handleAddUTR(tx)}
                                                        className='w-full bg-amber-500 text-white py-1.5 px-3 rounded-lg text-xs font-semibold hover:bg-amber-600 transition-colors'
                                                    >
                                                        Add UTR
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
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

export default MyOrders

