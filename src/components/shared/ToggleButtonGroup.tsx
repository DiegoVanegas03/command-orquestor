import { useState } from 'react'

export interface ToggleOption {
  value: string
  label: string
  icon?: string
}

interface ToggleButtonGroupProps {
  options: ToggleOption[]
  value?: string
  onChange?: (value: string) => void
}

export default function ToggleButtonGroup({ options, value, onChange }: ToggleButtonGroupProps) {
  // Si no se provee 'value', manejamos el estado de forma interna
  const [internalValue, setInternalValue] = useState(value ?? options[0]?.value)
  const currentValue = value !== undefined ? value : internalValue

  const handleSelect = (val: string) => {
    setInternalValue(val)
    onChange?.(val)
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const isActive = currentValue === option.value
        return (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`text-body-md py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isActive
                ? 'bg-carbon-black-400 text-bright-snow border-l-4 border-bright-snow shadow-sm hover:bg-carbon-black-600'
                : 'bg-carbon-black-100 text-pale-slate hover:bg-carbon-black-300 opacity-70 border-l-4 border-transparent'
            }`}
          >
            {option.icon && (
              <span className="material-symbols-outlined text-[18px]">{option.icon}</span>
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
