import { useState, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { site } from '../data/site'
import { getPosition, mapsLink, telHref, whatsappHref } from '../lib/contact'
import { Icon } from './Icon'

const base =
  'group relative inline-flex items-center gap-3.5 overflow-hidden rounded-2xl font-display font-bold select-none'

const sizes = {
  lg: 'min-h-16 w-full pl-2.5 pr-5 text-[1.15rem]',
  md: 'min-h-14 pl-2 pr-5 text-base',
}

function usePress() {
  const reduce = useReducedMotion()
  return reduce ? {} : { whileHover: { y: -3 }, whileTap: { scale: 0.97 } }
}

/** Hover'da soldan dolan ışık şeridi */
function Sheen() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-all duration-700 group-hover:left-[110%] group-hover:opacity-100"
    />
  )
}

interface BtnProps {
  size?: keyof typeof sizes
  className?: string
  children?: ReactNode
}

export function CallButton({ size = 'lg', className = '', children }: BtnProps) {
  const press = usePress()
  return (
    <m.a
      {...press}
      href={telHref}
      aria-label={`Hemen Ara, ${site.phoneDisplay}`}
      className={`${base} ${sizes[size]} bg-ink text-paper shadow-[0_14px_30px_-14px_rgb(22_25_29/0.6)] ${className}`}
    >
      <Sheen />
      <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-signal text-ink">
        <span className="ring-pulse absolute inset-0 rounded-xl border-2 border-signal" aria-hidden="true" />
        <Icon name="phone" className="relative size-5" />
      </span>
      {children ?? (
        <span className="flex flex-1 items-center justify-between gap-3">
          <span>Hemen Ara</span>{' '}
          <span className="font-sans text-sm font-bold text-paper/75 tabular-nums">{site.phoneDisplay}</span>
        </span>
      )}
    </m.a>
  )
}

export function WhatsAppButton({ size = 'lg', className = '', children }: BtnProps) {
  const press = usePress()
  return (
    <m.a
      {...press}
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp'tan Yaz (yeni sekmede açılır)"
      className={`${base} ${sizes[size]} bg-wa text-wa-ink shadow-[0_14px_30px_-14px_rgb(26_158_75/0.7)] ${className}`}
    >
      <Sheen />
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-wa-ink text-wa">
        <Icon name="whatsapp" className="size-5" />
      </span>
      {children ?? (
        <span className="flex flex-1 items-center justify-between gap-3">
          <span>WhatsApp’tan Yaz</span>
          <Icon name="arrow" className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      )}
    </m.a>
  )
}

type LocState = 'idle' | 'locating' | 'sent' | 'nolocation'

const stateText: Record<LocState, string> = {
  idle: '',
  locating: 'Konumunuz alınıyor…',
  sent: 'WhatsApp açılıyor, konumunuz mesaja eklendi.',
  nolocation: 'Konum alınamadı. WhatsApp konumsuz açılıyor; adresinizi yazabilirsiniz.',
}

/**
 * Tarayıcıdan konumu alır ve WhatsApp mesajına Google Maps linki olarak ekler.
 * İzin verilmezse ya da konum alınamazsa konumsuz mesajla devam eder.
 */
export function ShareLocationButton({
  className = '',
  label = 'Konumumu WhatsApp ile gönder',
}: {
  className?: string
  label?: string
}) {
  const [state, setState] = useState<LocState>('idle')
  const press = usePress()

  async function share() {
    if (state === 'locating') return
    setState('locating')
    const coords = await getPosition()
    setState(coords ? 'sent' : 'nolocation')
    const url = whatsappHref(coords ? mapsLink(coords.latitude, coords.longitude) : '')
    // Asenkron işlemden sonra window.open açılır pencere engeline takılır; doğrudan git.
    window.location.href = url
  }

  return (
    <div className={className}>
      <m.button
        {...press}
        type="button"
        onClick={share}
        aria-busy={state === 'locating'}
        aria-label={label}
        className="group inline-flex min-h-13 w-full items-center justify-center gap-2.5 rounded-2xl border border-dashed border-ink/40 bg-card/60 px-4 font-bold text-ink transition-colors hover:border-ink hover:bg-card"
      >
        <Icon
          name={state === 'locating' ? 'spinner' : 'pin'}
          className={`size-5 shrink-0 ${state === 'locating' ? 'animate-spin' : 'transition-transform group-hover:-translate-y-0.5'}`}
        />
        <span className="whitespace-nowrap">{state === 'locating' ? 'Konum alınıyor…' : label}</span>
      </m.button>
      <p role="status" aria-live="polite" className="mt-2 text-center text-sm text-muted empty:mt-0">
        {stateText[state]}
      </p>
    </div>
  )
}
