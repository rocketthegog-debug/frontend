import { useState, useEffect } from 'react'
import { IoCloseOutline, IoWarningOutline, IoInformationCircleOutline } from 'react-icons/io5'

function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'warning',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700'
}) {
  const [maxWidth, setMaxWidth] = useState('100%')

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

    if (isOpen) {
      updateMaxWidth()
      window.addEventListener('resize', updateMaxWidth)
      return () => window.removeEventListener('resize', updateMaxWidth)
    }
  }, [isOpen])

  if (!isOpen) return null

  const Icon = type === 'warning' ? IoWarningOutline : IoInformationCircleOutline
  const iconColor = type === 'warning' ? 'text-amber-600' : 'text-blue-600'
  const bgColor = type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
  const borderColor = type === 'warning' ? 'border-amber-200' : 'border-blue-200'

  return (
    <div 
      className='fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4'
      style={{
        left: maxWidth === '420px' ? '50%' : '0',
        right: maxWidth === '420px' ? 'auto' : '0',
        width: maxWidth,
        maxWidth: maxWidth,
        transform: maxWidth === '420px' ? 'translateX(-50%)' : 'none',
        marginLeft: maxWidth === '420px' ? '0' : 'auto',
        marginRight: maxWidth === '420px' ? '0' : 'auto'
      }}
      onClick={onClose}
    >
      <div 
        className='bg-white rounded-xl max-w-sm w-full shadow-xl mx-4'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='border-b border-gray-200'>
          <div className='p-3 flex items-center justify-between'>
            <div className='flex items-center gap-2 flex-1 min-w-0'>
              <Icon className={`${iconColor} text-base flex-shrink-0`} />
              <h3 className='text-sm font-bold text-gray-800 truncate'>{title}</h3>
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 text-base leading-none p-1 flex-shrink-0 transition-colors'
            >
              <IoCloseOutline />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='px-4 py-2.5'>
          <p className='text-sm text-gray-700 whitespace-pre-line leading-relaxed text-center'>{message}</p>
        </div>

        {/* Footer Actions */}
        <div className='border-t border-gray-200 px-4 py-2.5 flex gap-2'>
          <button
            onClick={onClose}
            className='flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors text-xs font-semibold'
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 ${confirmButtonClass} text-white py-2 px-3 rounded-lg transition-colors text-xs font-semibold`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog

