import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useModalStore } from '@/stores/useModalStore'

export const Modal = () => {
  const { isOpen, content, title, subtitle, headerAction, closeModal } = useModalStore()
  const [mounted, setMounted] = useState(false)

  // We use this to only render the portal on the client side
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeModal])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300">
      {/* Overlay click to close */}
      <div className="fixed inset-0" onClick={closeModal} aria-hidden="true" />

      {/* Modal Card */}
      <div className="relative bg-carbon-black-400 border border-white/5 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform scale-100 transition-transform duration-300 animate-in fade-in zoom-in-95 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 bg-carbon-black-400">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-bright-snow tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-xs font-semibold text-pale-slate tracking-wider uppercase mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {headerAction}
            <button
              onClick={closeModal}
              className="text-pale-slate hover:text-bright-snow hover:bg-white/10 p-1.5 rounded transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-xl leading-none">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 pt-0 max-h-[75vh] overflow-y-auto custom-scrollbar bg-carbon-black-400">
          {content}
        </div>
      </div>
    </div>,
    document.body,
  )
}
