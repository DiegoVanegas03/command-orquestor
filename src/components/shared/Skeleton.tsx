export interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  rounded?: string
}

export default function Skeleton({
  width = '100%',
  height = '20px',
  className = '',
  rounded = 'rounded-md',
}: SkeletonProps) {
  // Convertimos a píxeles si se pasa un número, si no dejamos el string (ej. '100%', '2rem')
  const styleWidth = typeof width === 'number' ? `${width}px` : width
  const styleHeight = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`animate-pulse bg-carbon-black-300 ${rounded} ${className}`}
      style={{
        width: styleWidth,
        height: styleHeight,
      }}
    />
  )
}
