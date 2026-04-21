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
            className={`relative text-body-md transition-all   shadow-2xs flex items-center justify-center gap-2 py-2 rounded-lg overflow-hidden ${
              isActive
                ? 'bg-carbon-black-400 text-bright-snow '
                : 'text-pale-slate hover:bg-carbon-black-300'
            }`}
          >
            {/* Indicador lateral */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-[4px] transition-colors ${
                isActive ? 'bg-bright-snow' : 'transparent'
              }`}
            />
            {option.icon && (
              <span className="material-symbols-outlined text-lg">{option.icon}</span>
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
