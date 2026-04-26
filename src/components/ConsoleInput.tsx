import { useState, useRef, useEffect } from 'react'

interface ConsoleInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function ConsoleInput({ value, onChange, placeholder }: ConsoleInputProps) {
  const [lineCount, setLineCount] = useState(1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to recalculate scrollHeight correctly
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight

      // Cálculo aproximado de líneas basado en scrollHeight
      // Línea base (1 fila) con py-4 (32px) y texto sm (aprox 20px) = 52px
      const currentLines = Math.max(1, Math.floor((scrollHeight - 20) / 20))
      setLineCount(Math.min(currentLines, 4))

      // Ajustamos la altura física del textarea limitado a ~4 líneas
      const maxHeight = 112 // (4 líneas * 20px) + 32px padding
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }, [value])

  return (
    <div className="mt-2 bg-carbon-black-300 rounded-b-lg relative group transition-all duration-300">
      {/* Símbolo de prompt alineado arriba */}
      <div className="absolute left-4 top-4 text-bright-snow font-bold font-mono">~$</div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-bright-snow font-mono text-sm pl-12 pr-4 py-4 border-none outline-none placeholder:text-pale-slate/50 focus:bg-carbon-black-400 transition-colors resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
        placeholder={placeholder}
        rows={1}
      />

      {/* Línea de focus inferior */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-bright-snow scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left"></div>

      {/* Indicador visual opcional del contador de líneas (puedes quitarlo si no lo quieres ver) */}
      <div className="absolute right-4 bottom-2 text-[10px] text-pale-slate/30 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
        L: {lineCount}/4
      </div>
    </div>
  )
}
