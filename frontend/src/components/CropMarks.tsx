/** Pafta köşelerindeki kesim işaretleri (dekoratif) */
export function CropMarks({ className = 'border-ink/40' }: { className?: string }) {
  const c = `pointer-events-none absolute size-4 ${className}`
  return (
    <span aria-hidden="true">
      <span className={`${c} -top-px -left-px border-t-2 border-l-2`} />
      <span className={`${c} -top-px -right-px border-t-2 border-r-2`} />
      <span className={`${c} -bottom-px -left-px border-b-2 border-l-2`} />
      <span className={`${c} -right-px -bottom-px border-r-2 border-b-2`} />
    </span>
  )
}
