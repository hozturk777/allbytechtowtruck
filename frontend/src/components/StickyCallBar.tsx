import { site } from '../data/site'
import { telHref, whatsappHref } from '../lib/contact'
import { Icon } from './Icon'

/** Mobilde ekranın altında her zaman görünen arama + WhatsApp çubuğu */
export function StickyCallBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-rule bg-paper px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_-18px_rgb(22_25_29/0.45)] md:hidden"
      role="region"
      aria-label="Hızlı iletişim"
    >
      <div className="grid grid-cols-[1.3fr_1fr] gap-2.5">
        <a
          href={telHref}
          aria-label={`Hemen Ara, ${site.phoneDisplay}`}
          className="flex min-h-14 items-center justify-center gap-2.5 rounded-2xl bg-ink font-display text-lg font-bold text-paper transition-transform active:scale-[0.97]"
        >
          <span className="relative grid size-8 place-items-center rounded-lg bg-signal text-ink">
            <span className="ring-pulse absolute inset-0 rounded-lg border-2 border-signal" aria-hidden="true" />
            <Icon name="phone" className="relative size-4" />
          </span>
          Hemen Ara
        </a>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp (yeni sekmede açılır)"
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-wa font-display text-lg font-bold text-wa-ink transition-transform active:scale-[0.97]"
        >
          <Icon name="whatsapp" className="size-5" />
          WhatsApp
        </a>
      </div>
    </div>
  )
}
