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
  const [value, setValue] = useState(initialValue)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10)
    setValue(newValue)
    onChange?.(newValue)
  }

  // Helper para determinar el texto del valor
  const getValueLabel = (val: number) => {
    if (val >= 40 && val <= 60) return 'Estándar (1x)'
    if (val < 40) return `Lento (${(val / 50).toFixed(1)}x)`
    return `Rápido (${(val / 50).toFixed(1)}x)`
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
            style={{ width: `${value}%` }}
          ></div>
        </div>

        <div
          className="absolute w-3 h-3 bg-bright-snow rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-active:opacity-100 transition-all duration-100 pointer-events-none z-20"
          style={{
            left: `${value}%`,
            transform: `translate(-50%, 0)`,
          }}
        ></div>

        {/* Input range invisible/transparente encima para la interacción */}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleChange}
          className="absolute w-full h-4 opacity-0 cursor-pointer z-10"
        />
      </div>

      <div className="flex justify-between text-caption text-pale-slate tracking-widest mt-2 uppercase">
        <span className={`${value <= 40 ? 'text-bright-snow' : ''}`}>{minLabel}</span>
        <span className={`${value >= 60 ? 'text-bright-snow' : ''}`}>{maxLabel}</span>
      </div>
    </div>
  )
}
