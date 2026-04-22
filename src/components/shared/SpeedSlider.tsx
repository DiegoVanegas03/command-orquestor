import { useState } from 'react'

interface SpeedSliderProps {
  label?: string
  minLabel?: string
  maxLabel?: string
  initialValue?: number
  onChange?: (value: number) => void
}

export default function SpeedSlider({
  label = 'Velocidad',
  minLabel = 'Lento',
  maxLabel = 'Máx',
  initialValue = 50,
  onChange,
}: SpeedSliderProps) {
  // value almacena el delay en milisegundos (0 = super rápido, 100 = muy lento)
  const [value, setValue] = useState(initialValue)

  // speedScore invierte el valor para la UI: 
  // 0% a la izquierda (delay=100) y 100% a la derecha (delay=0)
  const speedScore = 100 - value

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeedScore = parseInt(e.target.value, 10)
    const newDelay = 100 - newSpeedScore
    setValue(newDelay)
    onChange?.(newDelay)
  }

  // Helper para determinar el texto del valor
  const getValueLabel = (delay: number) => {
    if (delay >= 40 && delay <= 60) return 'Estándar (1.0x)'
    if (delay < 40) {
      const multiplier = delay === 0 ? 'MÁX' : `${(50 / delay).toFixed(1)}x`
      return `Rápido (${multiplier})`
    }
    return `Lento (${(50 / delay).toFixed(1)}x)`
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-3">
        <label className="text-caption text-pale-slate uppercase tracking-wider">{label}</label>
        <span className="text-bright-snow font-mono text-xs">{getValueLabel(value)}</span>
      </div>

      <div className="relative h-2 flex items-center group">
        {/* Track de fondo */}
        <div className="absolute w-full h-full bg-carbon-black-400 rounded-full overflow-hidden">
          {/* Progress bar visual */}
          <div
            className="h-full bg-linear-to-r from-pale-slate-400 to-bright-snow rounded-full transition-all duration-100"
            style={{ width: `${speedScore}%` }}
          ></div>
        </div>

        <div
          className="absolute w-3 h-3 bg-bright-snow rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-active:opacity-100 transition-all duration-100 pointer-events-none z-20"
          style={{
            left: `${speedScore}%`,
            transform: `translate(-50%, 0)`,
          }}
        ></div>

        {/* Input range invisible/transparente encima para la interacción */}
        <input
          type="range"
          min="0"
          max="100"
          value={speedScore}
          onChange={handleChange}
          className="absolute w-full h-4 opacity-0 cursor-pointer z-10"
        />
      </div>

      <div className="flex justify-between text-caption text-pale-slate tracking-widest mt-2 uppercase">
        <span className={`${speedScore <= 40 ? 'text-bright-snow' : ''}`}>{minLabel}</span>
        <span className={`${speedScore >= 60 ? 'text-bright-snow' : ''}`}>{maxLabel}</span>
      </div>
    </div>
  )
}
