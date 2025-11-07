import { useEffect } from 'react'
import { IoCheckmarkCircleOutline, IoCloseCircleOutline, IoInformationCircleOutline, IoWarningOutline, IoCloseOutline } from 'react-icons/io5'

function Alert({ type = 'info', message, isOpen, onClose, duration = 3000 }) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  const config = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-800',
      icon: IoCheckmarkCircleOutline,
      iconColor: 'text-green-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-800',
      icon: IoCloseCircleOutline,
      iconColor: 'text-red-600',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      text: 'text-amber-800',
      icon: IoWarningOutline,
      iconColor: 'text-amber-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-800',
      icon: IoInformationCircleOutline,
      iconColor: 'text-blue-600',
    },
  }

  const style = config[type] || config.info
  const Icon = style.icon

  return (
    <div className='fixed top-3 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-md px-4 pointer-events-none'>
      <div className={`${style.bg} ${style.border} border rounded-xl p-3 shadow-xl flex items-start gap-3 pointer-events-auto animate-slideDown`}>
        <Icon className={`${style.iconColor} text-xl flex-shrink-0 mt-0.5`} />
        <div className='flex-1 min-w-0'>
          <p className={`${style.text} text-sm font-medium break-words leading-relaxed`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`${style.text} hover:opacity-70 transition-opacity flex-shrink-0 p-1 -mt-1 -mr-1`}
          aria-label='Close alert'
        >
          <IoCloseOutline className='text-lg' />
        </button>
      </div>
    </div>
  )
}

export default Alert

