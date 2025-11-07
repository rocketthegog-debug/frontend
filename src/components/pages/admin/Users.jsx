import { useState, useEffect, useRef } from 'react'
import { APP_CONFIG } from '../../../config'
import { IoPeopleOutline, IoWalletOutline, IoTrashOutline, IoLockClosedOutline, IoLockOpenOutline, IoCreateOutline, IoCloseOutline, IoCopyOutline, IoCardOutline, IoSearchOutline } from 'react-icons/io5'
import { FiLogOut } from 'react-icons/fi'
import { deleteUser, restrictUser, updateUser, getPaymentMethodAdmin } from '../../../services/api'
import Alert from '../../Alert'
import ConfirmationDialog from '../../ConfirmationDialog'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

function AdminUsers({ user, onLogout }) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [deletingUserId, setDeletingUserId] = useState(null)
    const [restrictingUserId, setRestrictingUserId] = useState(null)
    const [editingUser, setEditingUser] = useState(null)
    const [editForm, setEditForm] = useState({
        name: '',
        password: '',
    })
    const [saving, setSaving] = useState(false)
    const [alert, setAlert] = useState({ isOpen: false, type: 'info', message: '' })
    const [confirmDialog, setConfirmDialog] = useState({ 
        isOpen: false, 
        title: '', 
        message: '', 
        onConfirm: () => {},
        type: 'warning',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700'
    })
    const [maxWidth, setMaxWidth] = useState('100%')
    const [bankAccountModal, setBankAccountModal] = useState({ isOpen: false, userId: null, userName: '', loading: false, data: null })
    const [pullToRefresh, setPullToRefresh] = useState({ isPulling: false, startY: 0, distance: 0 })
    const containerRef = useRef(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterTab, setFilterTab] = useState('user') // 'user', 'admin', 'all'

    useEffect(() => {
        loadUsers()
    }, [])

    // Get app container width for desktop constraint (matching MatchDetailsModal)
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

        updateMaxWidth()
        window.addEventListener('resize', updateMaxWidth)
        return () => window.removeEventListener('resize', updateMaxWidth)
    }, [editingUser])

    const loadUsers = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch(`${API_BASE_URL}/admin/users`)
            const data = await response.json()
            
            if (data.success) {
                setUsers(data.data || [])
            } else {
                setError(data.message || 'Failed to load users')
            }
        } catch (err) {
            console.error('Error loading users:', err)
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        } catch {
            return dateString
        }
    }

    const showAlert = (type, message) => {
        setAlert({ isOpen: true, type, message })
    }

    const handleDeleteUser = (userId, userName) => {
        if (!user?.phone) return
        
        setConfirmDialog({
            isOpen: true,
            title: 'Delete User',
            message: `Delete "${userName}"?\n\nThis action cannot be undone.`,
            type: 'warning',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            confirmButtonClass: 'bg-red-600 hover:bg-red-700',
            onConfirm: async () => {
                try {
                    setDeletingUserId(userId)
                    const response = await deleteUser(userId, user.phone)
                    
                    if (response.success) {
                        setUsers(users.filter(u => u._id !== userId && u.phone !== userId))
                        showAlert('success', `User "${userName}" deleted successfully`)
                    } else {
                        showAlert('error', response.message || 'Failed to delete user')
                    }
                } catch (err) {
                    console.error('Error deleting user:', err)
                    showAlert('error', 'Failed to delete user. Please try again.')
                } finally {
                    setDeletingUserId(null)
                }
            }
        })
    }

    const handleRestrictUser = (userId, userName, currentStatus) => {
        if (!user?.phone) return
        
        const newStatus = !currentStatus
        const action = newStatus ? 'restrict' : 'unrestrict'
        
        setConfirmDialog({
            isOpen: true,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
            message: `${action.charAt(0).toUpperCase() + action.slice(1)} "${userName}"?`,
            type: newStatus ? 'warning' : 'info',
            confirmText: action.charAt(0).toUpperCase() + action.slice(1),
            cancelText: 'Cancel',
            confirmButtonClass: newStatus ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700',
            onConfirm: async () => {
                try {
                    setRestrictingUserId(userId)
                    const response = await restrictUser(userId, user.phone, newStatus)
                    
                    if (response.success) {
                        setUsers(users.map(u => 
                            (u._id === userId || u.phone === userId) 
                                ? { ...u, isRestricted: newStatus }
                                : u
                        ))
                        showAlert('success', `User "${userName}" ${action}ed successfully`)
                    } else {
                        showAlert('error', response.message || `Failed to ${action} user`)
                    }
                } catch (err) {
                    console.error(`Error ${action}ing user:`, err)
                    showAlert('error', `Failed to ${action} user. Please try again.`)
                } finally {
                    setRestrictingUserId(null)
                }
            }
        })
    }

    const handleEditUser = (usr) => {
        setEditingUser(usr)
        setEditForm({
            name: usr.name || '',
            password: '',
        })
    }

    const handleCloseEdit = () => {
        setEditingUser(null)
        setEditForm({
            name: '',
            password: '',
        })
    }

    const handleSaveEdit = async () => {
        if (!user?.phone || !editingUser) return

        try {
            setSaving(true)
            
            // Prepare update data (only include fields that are provided)
            const updateData = {
                name: editForm.name.trim(),
            }
            
            // Only include password if it's not empty
            if (editForm.password.trim() !== '') {
                updateData.password = editForm.password.trim()
            }

            const response = await updateUser(editingUser._id || editingUser.phone, user.phone, updateData)
            
            if (response.success) {
                // Reload users to get the latest data from backend
                await loadUsers()
                showAlert('success', 'User updated successfully')
                handleCloseEdit()
            } else {
                showAlert('error', response.message || 'Failed to update user')
            }
        } catch (err) {
            console.error('Error updating user:', err)
            showAlert('error', 'Failed to update user. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleViewBankAccount = async (usr) => {
        const userId = usr._id || usr.phone
        setBankAccountModal({ isOpen: true, userId, userName: usr.name, loading: true, data: null })
        
        try {
            const response = await getPaymentMethodAdmin(userId)
            if (response.success && response.data) {
                setBankAccountModal(prev => ({ ...prev, loading: false, data: response.data }))
            } else {
                setBankAccountModal(prev => ({ ...prev, loading: false, data: null }))
                showAlert('info', response.message || 'No bank account details found for this user')
            }
        } catch (err) {
            console.error('Error fetching bank account:', err)
            setBankAccountModal(prev => ({ ...prev, loading: false, data: null }))
            showAlert('error', 'Failed to fetch bank account details')
        }
    }

    const handleCloseBankAccount = () => {
        setBankAccountModal({ isOpen: false, userId: null, userName: '', loading: false, data: null })
    }

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text).then(() => {
            showAlert('success', `${label} copied to clipboard!`)
        }).catch(() => {
            showAlert('error', 'Failed to copy to clipboard')
        })
    }

    // Pull to refresh handlers
    const handleTouchStart = (e) => {
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            setPullToRefresh({ isPulling: true, startY: e.touches[0].clientY, distance: 0 })
        }
    }

    const handleTouchMove = (e) => {
        if (pullToRefresh.isPulling) {
            const currentY = e.touches[0].clientY
            const distance = Math.max(0, currentY - pullToRefresh.startY)
            if (distance > 0 && containerRef.current?.scrollTop === 0) {
                setPullToRefresh(prev => ({ ...prev, distance: Math.min(distance, 80) }))
            }
        }
    }

    const handleTouchEnd = () => {
        if (pullToRefresh.isPulling && pullToRefresh.distance > 50) {
            loadUsers()
        }
        setPullToRefresh({ isPulling: false, startY: 0, distance: 0 })
    }

    // Filter and search users
    const filteredUsers = users.filter((usr) => {
        // Filter by tab
        if (filterTab === 'user' && usr.isAdmin) return false
        if (filterTab === 'admin' && !usr.isAdmin) return false
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim()
            return (
                usr.name?.toLowerCase().includes(query) ||
                usr.phone?.includes(query)
            )
        }
        
        return true
    })

    return (
        <div 
            ref={containerRef}
            className='flex flex-col py-4 px-4 pb-20 overflow-y-auto'
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-y' }}
        >
            {/* Header */}
            <div className='flex items-center justify-between gap-2 mb-3'>
                {/* Search Bar */}
                <div className='flex-1'>
                    <div className='relative'>
                        <IoSearchOutline className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base' />
                        <input
                            type='text'
                            placeholder='Search by name or phone...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-crickbuzz-green focus:border-crickbuzz-green'
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                            >
                                <IoCloseOutline className='text-base' />
                            </button>
                        )}
                    </div>
                </div>
                {onLogout && (
                    <button
                        onClick={onLogout}
                        className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-xs font-semibold text-red-600 flex-shrink-0'
                        title='Logout'
                    >
                        <FiLogOut className='text-sm' />
                        <span>Logout</span>
                    </button>
                )}
            </div>

            {/* Pull to refresh indicator */}
            {pullToRefresh.isPulling && pullToRefresh.distance > 0 && (
                <div className='text-center mb-2' style={{ transform: `translateY(${Math.min(pullToRefresh.distance, 60)}px)` }}>
                    <div className='inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-crickbuzz-green'></div>
                    <p className='text-xs text-crickbuzz-text-light mt-1'>
                        {pullToRefresh.distance > 50 ? 'Release to refresh' : 'Pull to refresh'}
                    </p>
                </div>
            )}

            {/* Filter Tabs */}
            <div className='flex gap-2 mb-3 border-b border-gray-200'>
                <button
                    onClick={() => setFilterTab('user')}
                    className={`px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                        filterTab === 'user'
                            ? 'text-crickbuzz-green border-b-2 border-crickbuzz-green'
                            : 'text-gray-600 hover:text-crickbuzz-text'
                    }`}
                >
                    User ({users.filter(u => !u.isAdmin).length})
                </button>
                <button
                    onClick={() => setFilterTab('admin')}
                    className={`px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                        filterTab === 'admin'
                            ? 'text-crickbuzz-green border-b-2 border-crickbuzz-green'
                            : 'text-gray-600 hover:text-crickbuzz-text'
                    }`}
                >
                    Admin ({users.filter(u => u.isAdmin).length})
                </button>
                <button
                    onClick={() => setFilterTab('all')}
                    className={`px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                        filterTab === 'all'
                            ? 'text-crickbuzz-green border-b-2 border-crickbuzz-green'
                            : 'text-gray-600 hover:text-crickbuzz-text'
                    }`}
                >
                    All ({users.length})
                </button>
            </div>

            {loading ? (
                <div className='text-center py-8'>
                    <p className='text-sm text-crickbuzz-text-light'>Loading users...</p>
                </div>
            ) : error ? (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-center'>
                    <p className='text-xs text-red-600'>{error}</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className='bg-crickbuzz-light rounded-lg p-8 text-center'>
                    <p className='text-sm text-crickbuzz-text-light'>
                        {searchQuery ? 'No users found matching your search' : 'No users found'}
                    </p>
                </div>
            ) : (
                <div className='space-y-2'>
                    {filteredUsers.map((usr) => (
                        <div 
                            key={usr._id || usr.phone} 
                            className={`rounded-lg p-3 border ${
                                usr.isAdmin 
                                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' 
                                    : 'bg-white border-gray-200'
                            }`}
                        >
                            {/* Header Row */}
                            <div className='flex items-center justify-between mb-2'>
                                <div className='flex items-center gap-2 flex-1 min-w-0'>
                                    <div className={`rounded-full p-1.5 flex-shrink-0 ${
                                        usr.isAdmin 
                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                                            : 'bg-gradient-to-br from-crickbuzz-green to-green-600'
                                    }`}>
                                        <IoPeopleOutline className='text-white text-sm' />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center gap-1.5 flex-wrap'>
                                            <p className={`text-sm font-semibold truncate ${
                                                usr.isAdmin ? 'text-blue-700' : 'text-crickbuzz-text'
                                            }`}>
                                                {usr.name}
                                            </p>
                                            {usr.isAdmin && (
                                                <span className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0'>
                                                    Admin
                                                </span>
                                            )}
                                            {usr.isRestricted && !usr.isAdmin && (
                                                <span className='bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0'>
                                                    Restricted
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs mt-0.5 ${
                                            usr.isAdmin ? 'text-blue-600' : 'text-crickbuzz-text-light'
                                        }`}>
                                            {usr.phone}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className='flex items-center gap-1 flex-shrink-0'>
                                    {usr.isAdmin ? (
                                        <button
                                            onClick={() => handleEditUser(usr)}
                                            className='p-1.5 rounded-lg transition-all bg-blue-100 text-blue-600 hover:bg-blue-200 active:scale-95'
                                            title='Edit User'
                                        >
                                            <IoCreateOutline className='text-base' />
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleViewBankAccount(usr)}
                                                className='p-1.5 rounded-lg transition-all bg-purple-100 text-purple-600 hover:bg-purple-200 active:scale-95'
                                                title='View Bank Account'
                                            >
                                                <IoCardOutline className='text-base' />
                                            </button>
                                            <button
                                                onClick={() => handleEditUser(usr)}
                                                className='p-1.5 rounded-lg transition-all bg-blue-100 text-blue-600 hover:bg-blue-200 active:scale-95'
                                                title='Edit User'
                                            >
                                                <IoCreateOutline className='text-base' />
                                            </button>
                                            <button
                                                onClick={() => handleRestrictUser(usr._id || usr.phone, usr.name, usr.isRestricted)}
                                                disabled={restrictingUserId === (usr._id || usr.phone)}
                                                className={`p-1.5 rounded-lg transition-all active:scale-95 ${
                                                    restrictingUserId === (usr._id || usr.phone)
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : usr.isRestricted
                                                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                            : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                                }`}
                                                title={usr.isRestricted ? 'Unrestrict User' : 'Restrict User'}
                                            >
                                                {usr.isRestricted ? (
                                                    <IoLockOpenOutline className='text-base' />
                                                ) : (
                                                    <IoLockClosedOutline className='text-base' />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(usr._id || usr.phone, usr.name)}
                                                disabled={deletingUserId === (usr._id || usr.phone)}
                                                className={`p-1.5 rounded-lg transition-all active:scale-95 ${
                                                    deletingUserId === (usr._id || usr.phone)
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                }`}
                                                title='Delete User'
                                            >
                                                <IoTrashOutline className='text-base' />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Balance Row (only for non-admin) */}
                            {!usr.isAdmin && (
                                <div className='flex items-center justify-between pt-2 border-t border-gray-100'>
                                    <div className='flex items-center gap-2'>
                                        <IoWalletOutline className='text-crickbuzz-green text-sm flex-shrink-0' />
                                        <div>
                                            <p className='text-xs text-gray-500'>Balance</p>
                                            <p className='text-sm font-bold text-crickbuzz-green'>
                                                {APP_CONFIG.currency} {usr.walletBalance?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-xs text-gray-500'>Joined</p>
                                        <p className='text-xs font-semibold text-gray-700'>{formatDate(usr.createdAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Edit User Modal - Matching MatchDetailsModal Style */}
            {editingUser && (
                <div
                    className='fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col justify-end overflow-hidden'
                    style={{
                        left: maxWidth === '420px' ? '50%' : '0',
                        right: maxWidth === '420px' ? 'auto' : '0',
                        width: maxWidth,
                        maxWidth: maxWidth,
                        transform: maxWidth === '420px' ? 'translateX(-50%)' : 'none',
                        marginLeft: maxWidth === '420px' ? '0' : 'auto',
                        marginRight: maxWidth === '420px' ? '0' : 'auto'
                    }}
                    onClick={handleCloseEdit}
                >
                    <div
                        className='bg-white rounded-t-2xl overflow-y-auto shadow-xl mt-12'
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
                                <div className='flex items-center gap-2 flex-1 min-w-0'>
                                    <div className='bg-crickbuzz-green rounded-full p-2 flex-shrink-0'>
                                        <IoPeopleOutline className='text-white text-sm' />
                                    </div>
                                    <h3 className='text-sm font-bold text-crickbuzz-text truncate'>
                                        Edit User: {editingUser.name}
                                    </h3>
                                </div>
                                <button
                                    onClick={handleCloseEdit}
                                    className='text-gray-500 hover:text-gray-700 text-xl leading-none p-1 flex-shrink-0'
                                >
                                    <IoCloseOutline />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className='p-3'>
                            <div className='space-y-4'>
                                {/* Name */}
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 mb-2'>
                                        Name
                                    </label>
                                    <input
                                        type='text'
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className='w-full bg-white rounded-lg px-3 py-2.5 text-sm text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-crickbuzz-green focus:ring-opacity-30 focus:border-crickbuzz-green transition-colors'
                                    />
                                </div>

                                {/* Phone (read-only) */}
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 mb-2'>
                                        Phone Number
                                    </label>
                                    <input
                                        type='text'
                                        value={editingUser.phone}
                                        disabled
                                        className='w-full bg-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-600 cursor-not-allowed border border-gray-200'
                                    />
                                    <p className='text-xs text-gray-500 mt-1.5 ml-0.5'>Phone number cannot be changed</p>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 mb-2'>
                                        New Password
                                    </label>
                                    <input
                                        type='password'
                                        value={editForm.password}
                                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                        placeholder='Enter new password'
                                        className='w-full bg-white rounded-lg px-3 py-2.5 text-sm text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-crickbuzz-green focus:ring-opacity-30 focus:border-crickbuzz-green transition-colors placeholder:text-gray-400'
                                    />
                                    <p className='text-xs text-gray-500 mt-1.5 ml-0.5'>Leave empty to keep current password</p>
                                </div>

                                {/* Admin Status (read-only) */}
                                {editingUser.isAdmin && (
                                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                                        <p className='text-xs text-blue-700 font-medium'>
                                            This is an admin account
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className='sticky bottom-0 bg-white border-t border-gray-200 p-3 pb-16 flex gap-2 shadow-lg'>
                            <button
                                onClick={handleCloseEdit}
                                className='flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors text-xs font-semibold'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={saving || !editForm.name.trim()}
                                className='flex-1 bg-crickbuzz-green text-white py-2 px-3 rounded-lg hover:bg-crickbuzz-green-dark transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Component */}
            <Alert
                isOpen={alert.isOpen}
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ ...alert, isOpen: false })}
            />

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type={confirmDialog.type}
                confirmText={confirmDialog.confirmText}
                cancelText={confirmDialog.cancelText}
                confirmButtonClass={confirmDialog.confirmButtonClass}
            />

            {/* Bank Account Details Modal */}
            {bankAccountModal.isOpen && (
                <div
                    className='fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col justify-end overflow-hidden'
                    style={{
                        left: maxWidth === '420px' ? '50%' : '0',
                        right: maxWidth === '420px' ? 'auto' : '0',
                        width: maxWidth,
                        maxWidth: maxWidth,
                        transform: maxWidth === '420px' ? 'translateX(-50%)' : 'none',
                        marginLeft: maxWidth === '420px' ? '0' : 'auto',
                        marginRight: maxWidth === '420px' ? '0' : 'auto'
                    }}
                    onClick={handleCloseBankAccount}
                >
                    <div
                        className='bg-white rounded-t-2xl overflow-y-auto shadow-xl mt-12'
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
                                <div className='flex items-center gap-2 flex-1 min-w-0'>
                                    <div className='bg-purple-500 rounded-full p-2 flex-shrink-0'>
                                        <IoCardOutline className='text-white text-sm' />
                                    </div>
                                    <h3 className='text-sm font-bold text-crickbuzz-text truncate'>
                                        Bank Account: {bankAccountModal.userName}
                                    </h3>
                                </div>
                                <button
                                    onClick={handleCloseBankAccount}
                                    className='text-gray-500 hover:text-gray-700 text-xl leading-none p-1 flex-shrink-0'
                                >
                                    <IoCloseOutline />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className='p-3'>
                            {bankAccountModal.loading ? (
                                <div className='text-center py-8'>
                                    <div className='inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mb-2'></div>
                                    <p className='text-xs text-crickbuzz-text-light'>Loading bank account details...</p>
                                </div>
                            ) : bankAccountModal.data ? (
                                <div className='space-y-3'>
                                    {/* Account Holder Name */}
                                    <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
                                        <label className='block text-xs font-semibold text-gray-600 mb-1'>Account Holder Name</label>
                                        <div className='flex items-center justify-between gap-2'>
                                            <p className='text-sm font-semibold text-crickbuzz-text flex-1'>{bankAccountModal.data.accountHolderName}</p>
                                            <button
                                                onClick={() => copyToClipboard(bankAccountModal.data.accountHolderName, 'Account holder name')}
                                                className='p-1.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors'
                                                title='Copy'
                                            >
                                                <IoCopyOutline className='text-sm' />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Account Number */}
                                    <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
                                        <label className='block text-xs font-semibold text-gray-600 mb-1'>Account Number</label>
                                        <div className='flex items-center justify-between gap-2'>
                                            <p className='text-sm font-semibold text-crickbuzz-text flex-1 font-mono'>{bankAccountModal.data.accountNumber}</p>
                                            <button
                                                onClick={() => copyToClipboard(bankAccountModal.data.accountNumber, 'Account number')}
                                                className='p-1.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors'
                                                title='Copy'
                                            >
                                                <IoCopyOutline className='text-sm' />
                                            </button>
                                        </div>
                                    </div>

                                    {/* IFSC Code */}
                                    <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
                                        <label className='block text-xs font-semibold text-gray-600 mb-1'>IFSC Code</label>
                                        <div className='flex items-center justify-between gap-2'>
                                            <p className='text-sm font-semibold text-crickbuzz-text flex-1 font-mono'>{bankAccountModal.data.ifscCode}</p>
                                            <button
                                                onClick={() => copyToClipboard(bankAccountModal.data.ifscCode, 'IFSC code')}
                                                className='p-1.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors'
                                                title='Copy'
                                            >
                                                <IoCopyOutline className='text-sm' />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bank Name */}
                                    {bankAccountModal.data.bankName && (
                                        <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
                                            <label className='block text-xs font-semibold text-gray-600 mb-1'>Bank Name</label>
                                            <div className='flex items-center justify-between gap-2'>
                                                <p className='text-sm font-semibold text-crickbuzz-text flex-1'>{bankAccountModal.data.bankName}</p>
                                                <button
                                                    onClick={() => copyToClipboard(bankAccountModal.data.bankName, 'Bank name')}
                                                    className='p-1.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors'
                                                    title='Copy'
                                                >
                                                    <IoCopyOutline className='text-sm' />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* UPI ID */}
                                    {bankAccountModal.data.upiId && (
                                        <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
                                            <label className='block text-xs font-semibold text-gray-600 mb-1'>UPI ID</label>
                                            <div className='flex items-center justify-between gap-2'>
                                                <p className='text-sm font-semibold text-crickbuzz-text flex-1'>{bankAccountModal.data.upiId}</p>
                                                <button
                                                    onClick={() => copyToClipboard(bankAccountModal.data.upiId, 'UPI ID')}
                                                    className='p-1.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors'
                                                    title='Copy'
                                                >
                                                    <IoCopyOutline className='text-sm' />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className='bg-gray-50 rounded-lg p-6 text-center'>
                                    <IoCardOutline className='text-4xl text-gray-400 mx-auto mb-2' />
                                    <p className='text-sm text-gray-600'>No bank account details found</p>
                                    <p className='text-xs text-gray-500 mt-1'>This user has not added bank account details yet</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className='sticky bottom-0 bg-white border-t border-gray-200 p-3 pb-16 flex gap-2 shadow-lg'>
                            <button
                                onClick={handleCloseBankAccount}
                                className='flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors text-xs font-semibold'
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminUsers

