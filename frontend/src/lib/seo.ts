// Saf TS (JSX yok): vite.config.ts içinden de içe aktarılır ve <head>'e basılır.
import { site } from '../data/site.ts'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function jsonLd() {
  const business = {
    '@context': 'https://schema.org',
    '@type': ['TowingService', 'LocalBusiness'],
    '@id': `${site.url}/#isletme`,
    name: site.name,
    url: site.url,
    telephone: site.phoneE164,
    description: site.seo.description,
    priceRange: '₺₺',
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.city,
      addressRegion: site.region,
      addressCountry: 'TR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    areaServed: [
      ...site.regions.map((r) => ({ '@type': 'Place', name: r.name.replace(' geneli', '') })),
      ...site.roads.map((r) => ({ '@type': 'Place', name: `${r.code} hattı` })),
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Hizmetler',
      itemListElement: site.services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, description: s.text },
      })),
    },
  }
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: site.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  // </script> kaçışı
  return [business, faq].map((o) => JSON.stringify(o).replace(/</g, '\\u003c'))
}

export function headTags() {
  const { title, description } = site.seo
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(site.url)}/" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="tr_TR" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(site.url)}/" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    ...jsonLd().map((j) => `<script type="application/ld+json">${j}</script>`),
  ].join('\n    ')
}
