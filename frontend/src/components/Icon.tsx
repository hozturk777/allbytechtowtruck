import type { ReactNode } from 'react'
import type { IconName } from '../data/site'

type Name = IconName | 'phone' | 'whatsapp' | 'pin' | 'chevron' | 'arrow' | 'check' | 'spinner' | 'plus'

// 24×24, 2px çizgi; hepsi aynı aileden, ek ikon kütüphanesi yok.
const paths: Record<Name, ReactNode> = {
  phone: (
    <path d="M5 3.5h3.2l1.6 4.2-2.2 1.4a11 11 0 0 0 7.3 7.3l1.4-2.2 4.2 1.6V19a1.5 1.5 0 0 1-1.6 1.5A17 17 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5Z" />
  ),
  whatsapp: (
    <>
      <path d="M3.6 20.4 4.9 16A8.6 8.6 0 1 1 8 19.2Z" />
      <path d="M9 8.3c.2-.4.6-.4.9-.4l.6 1.5c.1.3 0 .5-.2.7l-.5.6c.6 1.3 1.6 2.3 2.9 2.9l.6-.5c.2-.2.4-.3.7-.2l1.5.6c0 .3 0 .7-.4.9-.6.6-1.5.8-2.3.5a8 8 0 0 1-4.3-4.3c-.3-.8-.1-1.7.5-2.3Z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  tow: (
    <>
      <path d="M2 17V9h7l2 4h4V8l6-3" />
      <path d="M21 5v4" />
      <path d="M11 13v4M15 13h7v4" />
      <circle cx="6" cy="17.5" r="2" />
      <circle cx="17" cy="17.5" r="2" />
      <path d="M8 17.5h7" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a4 4 0 0 0 5 5L21 10a5.5 5.5 0 0 1-7.4 5.2L7 21.8a2 2 0 0 1-2.8-2.8l6.6-6.6A5.5 5.5 0 0 1 16 5Z" />
  ),
  battery: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M7 7V5M17 7V5M6.5 13.5h3M16 12v3M14.5 13.5h3" />
    </>
  ),
  tire: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3v5.5M12 15.5V21M3 12h5.5M15.5 12H21" />
    </>
  ),
  crash: (
    <>
      <path d="M3 16v-3l2-4.5h7.5L15 13v3" />
      <path d="M3 16h12" />
      <circle cx="6" cy="17.5" r="1.6" />
      <circle cx="12.5" cy="17.5" r="1.6" />
      <path d="m18 4 1 3 2.5-1-1 3 2 1.5-3 .5" />
    </>
  ),
  motorcycle: (
    <>
      <circle cx="5.5" cy="16.5" r="3" />
      <circle cx="18.5" cy="16.5" r="3" />
      <path d="M5.5 16.5 9 11h5l4.5 5.5" />
      <path d="m12 16.5 2-5.5M14 7h2.5l2 4.5M8 11 7 8.5H4.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  bolt: <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12Z" />,
  shield: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6Z" />
      <path d="m8.8 12 2.3 2.3 4.4-4.6" />
    </>
  ),
  tag: (
    <>
      <path d="M3 12.6V4a1 1 0 0 1 1-1h8.6l8.7 8.7a1 1 0 0 1 0 1.4l-7.9 7.9a1 1 0 0 1-1.4 0Z" />
      <circle cx="7.8" cy="7.8" r="1.4" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  spinner: <path d="M12 3a9 9 0 1 0 9 9" />,
  plus: <path d="M12 5v14M5 12h14" />,
}

interface Props {
  name: Name
  className?: string
}

export function Icon({ name, className = 'size-6' }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}
