interface DivisorProps {
  className?: string
}

export default function Divisor({ className }: DivisorProps) {
  return <div className={`w-full border-t border-dashed border-white/10 ${className}`} />
}
