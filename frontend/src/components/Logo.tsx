import { site } from '../data/site'
import logoUrl from '../assets/brand/logo.png'

/** Firma logosu (scripts/make-logo.mjs ile saydam zemine çevrilmiş, 674×96) */
export function LogoImage({ className = 'h-[30px] w-auto max-[379px]:h-[25px] sm:h-10 lg:h-9 xl:h-10' }: { className?: string }) {
  return (
    <a href="#top" className="flex shrink-0 items-center">
      <img src={logoUrl} width={674} height={96} alt={`${site.name}, sayfa başı`} className={className} />
    </a>
  )
}
