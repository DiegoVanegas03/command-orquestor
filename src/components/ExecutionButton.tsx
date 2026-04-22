import { useState, useEffect } from 'react'

interface ExecutionButtonProps {
  onClick?: () => void
  label?: string
  duration?: number
  disabled?: boolean
}

export default function ExecutionButton({
  onClick,
  label = 'Ejecutar Secuencia',
  disabled,
  duration = 2000,
}: ExecutionButtonProps) {
  const [status, setStatus] = useState<'idle' | 'executing' | 'success'>('idle')
  const [progress, setProgress] = useState(0)

  const handleStart = () => {
    if (status !== 'idle') return
    setStatus('executing')
    setProgress(0)
    onClick?.()
  }

  useEffect(() => {
    if (status === 'executing') {
      const intervalMs = 16
      const increment = 100 / (duration / intervalMs)

      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer)
            setStatus('success')
            setTimeout(() => {
              setStatus('idle')
              setProgress(0)
            }, 2000)
            return 100
          }
          return prev + increment
        })
      }, intervalMs)

      return () => clearInterval(timer)
    }
  }, [status, duration])

  const isIdle = status === 'idle'
  const isExecuting = status === 'executing'
  const isSuccess = status === 'success'

  return (
    <button
      onClick={handleStart}
      disabled={!isIdle || disabled}
      className={`w-full relative h-14 rounded-xl font-semibold text-subtitle-2 tracking-wide uppercase overflow-hidden transition-all duration-300 group
        ${
          disabled
            ? 'bg-carbon-black-300 text-pale-slate/50 cursor-not-allowed border border-white/5 opacity-70'
            : !isIdle
              ? 'bg-linear-to-br from-bright-snow-400 to-bright-snow-100 text-carbon-black cursor-default shadow-[0_10px_30px_rgba(255,255,255,0.1)]'
              : 'bg-linear-to-br from-bright-snow-400 to-bright-snow-100 text-carbon-black hover:scale-[0.98] shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)] cursor-pointer'
        }`}
    >
      {/* Capa de progreso (Background Fill) */}
      <div
        className={`absolute inset-y-0 left-0 bg-linear-to-r from-bright-snow-400/40 to-bright-snow-100 transition-all duration-150 ease-linear
          ${isExecuting ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: `${progress}%` }}
      >
        {/* El Rocket en la punta del progreso */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center justify-center">
          <span className="material-symbols-outlined text-carbon-black rotate-45 text-[24px] drop-shadow-md">
            rocket_launch
          </span>
        </div>
      </div>

      {/* Contenido del botón */}
      <div className="relative z-10 flex items-center justify-center gap-3">
        {isIdle && (
          <>
            <span className="material-symbols-outlined group-hover:translate-x-1 group-hover:rotate-45 transition-transform duration-300">
              rocket_launch
            </span>
            <span>{label}</span>
          </>
        )}

        {isExecuting && (
          <span className="text-bright-snow font-mono text-xs tracking-[0.2em]">
            PROCESANDO {Math.round(progress)}%
          </span>
        )}

        {isSuccess && (
          <div className="flex items-center gap-2 text-bright-snow animate-bounce">
            <span className="material-symbols-outlined">check_circle</span>
            <span>Completado</span>
          </div>
        )}
      </div>
    </button>
  )
}
