/**
 * Sitenin TÜM firma bilgileri burada.
 * Başka bir çekici firması için yalnızca bu dosyayı değiştirmeniz yeterli:
 * başlık, meta etiketleri, JSON-LD şeması ve tüm bölümler buradan beslenir.
 */

export type IconName =
  | 'tow'
  | 'wrench'
  | 'battery'
  | 'tire'
  | 'crash'
  | 'motorcycle'
  | 'clock'
  | 'bolt'
  | 'shield'
  | 'tag'

export interface Service {
  icon: IconName
  title: string
  text: string
}

export interface Reason {
  icon: IconName
  /** Büyük yazılan değer; içindeki ilk sayı görünüme girince sayarak gelir */
  stat: string
  title: string
  text: string
}

export interface Region {
  name: string
  /** Kısa not, ör. tahmini varış süresi */
  note: string
  /** Şematik haritadaki konumu (600×380 tuvalinde x, y) */
  pos: [number, number]
  /** Etiketin noktaya göre yönü */
  label?: 'top' | 'bottom' | 'left' | 'right' | 'topLeft'
}

export interface GalleryItem {
  /** Görselin adı (scripts/make-gallery.mjs çıktısı, ör. "01-tasima") */
  file: string
  /** Kısa başlık, fotoğrafın altında */
  title: string
  /** Yer / yol, ör. "TEM · Gebze" */
  place: string
  /** Ekran okuyucu ve arama motorları için açıklama */
  alt: string
}

export interface Faq {
  q: string
  a: string
}

const PHONE_DISPLAY = '0555 000 00 00'
const AVG_ARRIVAL_MIN = 30

export const site = {
  /** Tam ticari ad */
  name: 'Allbytech Çekici Hizmetleri',
  /** Logoda iki satıra bölünen kısa ad */
  brand: 'Allbytech',
  brandSub: 'Çekici Hizmetleri',

  /** Sitenin yayınlanacağı adres (canonical, JSON-LD ve og:url için) */
  url: 'https://www.allbytech-cekici.com',

  /** Telefon: ekranda görünen (dosyanın başındaki PHONE_DISPLAY) ve tel: biçimi */
  phoneDisplay: PHONE_DISPLAY,
  phoneE164: '+905550000000',

  /** WhatsApp numarası: ülke koduyla, yalnız rakam (wa.me için) */
  whatsapp: '905550000000',
  /** WhatsApp'ta hazır gelen mesaj; konum paylaşılırsa sonuna Google Maps linki eklenir */
  whatsappMessage: 'Merhaba, çekici hizmeti için yazıyorum. Konumum: ',

  /** Ortalama varış süresi (dakika; dosyanın başındaki AVG_ARRIVAL_MIN) */
  avgArrivalMinutes: AVG_ARRIVAL_MIN,

  hoursText: '7/24 açık. Hafta sonu ve bayramlarda da hizmetinizdeyiz.',
  hoursShort: '7/24',

  /** Hizmet bölgesinin kısa özeti (hero üst satırı ve meta) */
  areaLine: 'Gebze · Darıca · Çayırova · Dilovası',
  city: 'Gebze',
  region: 'Kocaeli',
  /** JSON-LD için yaklaşık merkez koordinatı */
  geo: { lat: 40.8028, lng: 29.4307 },

  seo: {
    title: 'Gebze Çekici | 7/24 Oto Kurtarma – Allbytech Çekici Hizmetleri',
    description:
      `Gebze, Darıca, Çayırova, Dilovası ve tüm Kocaeli’de 7/24 oto çekici ve yol yardım. TEM ve D-100 hattında ortalama ${AVG_ARRIVAL_MIN} dakikada yanınızdayız. Hemen arayın: ${PHONE_DISPLAY}`,
  },

  regions: [
    { name: 'Gebze', note: '~20 dk', pos: [285, 180], label: 'top' },
    { name: 'Darıca', note: '~25 dk', pos: [95, 262], label: 'right' },
    { name: 'Çayırova', note: '~25 dk', pos: [160, 162], label: 'top' },
    { name: 'Dilovası', note: '~30 dk', pos: [420, 230], label: 'bottom' },
    { name: 'Kocaeli geneli', note: '~45 dk', pos: [560, 202], label: 'topLeft' },
  ] satisfies Region[],

  /**
   * Hizmet bölgesinin şematik haritası (gerçek ölçekli değildir).
   * Tuval 600×380; yollar SVG path verisi. Başka bir şehir için bu yolları ve
   * `regions[].pos` değerlerini değiştirin.
   */
  map: {
    /** Merkez (menzil halkası buradan yayılır) */
    hq: 'Gebze',
    /** Deniz / kıyı çizgisi */
    coast:
      'M0,300 C60,285 110,300 150,292 S250,262 330,270 S430,292 470,278 S560,252 600,256 V380 H0 Z',
    roads: [
      { code: 'TEM', kind: 'otoyol', d: 'M0,96 C120,92 220,98 330,110 S500,142 600,150', label: [36, 82] },
      {
        code: 'D-100',
        kind: 'devlet',
        d: 'M0,182 C70,172 120,162 160,162 S240,172 285,180 S372,216 420,230 S530,206 600,200',
        label: [20, 160],
      },
    ],
    /** Ara bağlantı yolları */
    links: ['M95,262 C108,228 128,190 160,164', 'M285,180 C292,150 300,130 310,110', 'M420,230 C440,200 452,160 470,128'],
    /** Çekici simgesinin sürekli dolaştığı yol (roads[].code) */
    truckRoad: 'D-100',
  } as const,

  /** Hizmet verilen ana yollar (levha renkleri: otoyol yeşil, devlet yolu mavi) */
  roads: [
    { code: 'TEM', label: 'Otoyol', kind: 'otoyol' },
    { code: 'D-100', label: 'Devlet yolu', kind: 'devlet' },
  ] as const,

  services: [
    {
      icon: 'tow',
      title: 'Oto çekici',
      text: 'Arızalı ya da çalışmayan aracınızı kayar kasa ile güvenle istediğiniz adrese taşırız.',
    },
    {
      icon: 'wrench',
      title: 'Yol yardım',
      text: 'Küçük arızalara yerinde müdahale; mümkünse aracınız çekilmeden yola devam eder.',
    },
    {
      icon: 'battery',
      title: 'Akü takviyesi',
      text: 'Akünüz bittiyse takviye ile aracınızı birkaç dakikada yeniden çalıştırırız.',
    },
    {
      icon: 'tire',
      title: 'Lastik değişimi',
      text: 'Patlak lastiği yolda yedek lastiğinizle güvenli şekilde değiştiririz.',
    },
    {
      icon: 'crash',
      title: 'Kaza sonrası çekim',
      text: 'Kaza yapan aracınızı servise, otoparka ya da eksper noktasına taşırız.',
    },
    {
      icon: 'motorcycle',
      title: 'Motosiklet taşıma',
      text: 'Motosikletinizi özel bağlama ekipmanıyla çizilmeden, sabitlenmiş şekilde taşırız.',
    },
  ] satisfies Service[],

  reasons: [
    {
      icon: 'clock',
      stat: '7/24',
      title: '7/24 hizmet',
      text: 'Gece, hafta sonu, bayram fark etmez. Telefonu her zaman açarız.',
    },
    {
      icon: 'bolt',
      stat: `${AVG_ARRIVAL_MIN} dk`,
      title: 'Hızlı varış',
      text: `Gebze merkezde ortalama ${AVG_ARRIVAL_MIN} dakikada yanınızdayız.`,
    },
    {
      icon: 'shield',
      stat: '%100',
      title: 'Sigortalı taşıma',
      text: 'Aracınız taşıma süresince sigorta güvencesi altındadır.',
    },
    {
      icon: 'tag',
      stat: 'Net',
      title: 'Uygun fiyat',
      text: 'Fiyatı yola çıkmadan önce telefonda net olarak söyleriz, sürpriz olmaz.',
    },
  ] satisfies Reason[],

  steps: [
    { title: 'Arayın', text: 'Telefonla ya da WhatsApp’tan bize ulaşın, durumu kısaca anlatın.' },
    { title: 'Konumunuzu paylaşın', text: 'Tek dokunuşla konumunuzu WhatsApp’tan gönderin.' },
    { title: 'Ekibimiz yola çıksın', text: 'En yakın çekicimiz hemen yola çıkar, size varış süresini söyleriz.' },
  ],

  /**
   * Galeri ("Sahadan kareler"). Fotoğrafları bir klasöre koyup
   * `npm run gallery -- ../galeri` çalıştırın; `file` o klasördeki dosya adıdır
   * (küçük harf, Türkçe karaktersiz, uzantısız). Sıra burada belirlenir; ilk
   * fotoğraf büyük gösterilir. 6 fotoğrafa göre düzenlenmiştir (4–8 arası da olur).
   */
  gallery: [
    {
      file: '01-tasima',
      title: 'Kayar kasa ile taşıma',
      place: 'D-100 · Gebze',
      alt: 'Gri sedan otomobil, kırmızı kayar kasalı çekicinin üzerinde yandan görünüm',
    },
    {
      file: '04-rampa-yukleme',
      title: 'Rampadan yükleme',
      place: 'TEM · Çayırova',
      alt: 'Kasası eğik indirilmiş çekiciye gri sedanın vinçle yüklenmesi',
    },
    {
      file: '02-sabitleme',
      title: 'Zincirle sabitleme',
      place: 'Dilovası',
      alt: 'Çekici kasasında zincirle sabitlenmiş aracın tekerleği ve kasa ışıkları yakın plan',
    },
    {
      file: '05-arka-aci',
      title: 'Kasaya çekiş',
      place: 'Darıca',
      alt: 'Arkadan görünüm: sedan otomobil eğimli kasa üzerinde yukarı çekiliyor',
    },
    {
      file: '03-kasada-yan',
      title: 'Yola hazır',
      place: 'TEM · Gebze',
      alt: 'Yüklemesi biten çekici, araç kasada sabitlenmiş, yandan görünüm',
    },
    {
      file: '06-kayar-kasa',
      title: 'Hasarsız yükleme',
      place: 'Kocaeli',
      alt: 'Çekicinin kayar kasası indirilmiş, otomobil kasaya yaklaşıyor',
    },
  ] satisfies GalleryItem[],

  faq: [
    {
      q: 'Fiyat nasıl belirlenir?',
      a: 'Fiyat; aracınızın türüne, bulunduğunuz konuma ve gideceği adrese olan mesafeye göre belirlenir. Ekibimiz yola çıkmadan önce size net fiyatı telefonda söyler, sonradan ek ücret çıkmaz.',
    },
    {
      q: 'Ne kadar sürede gelirsiniz?',
      a: 'Gebze, Darıca ve Çayırova’da ortalama 20–30 dakikada, Kocaeli genelinde ise trafiğe bağlı olarak 30–60 dakikada yanınızdayız. Aradığınızda size tahmini varış süresini söyleriz.',
    },
    {
      q: 'Hangi araçları taşıyorsunuz?',
      a: 'Otomobil, SUV, hafif ticari araç, panelvan ve motosiklet taşıyoruz. Aracınızın durumuna göre uygun ekipmanla geliriz.',
    },
    {
      q: 'Gece ya da bayramda da hizmet veriyor musunuz?',
      a: 'Evet. 7 gün 24 saat, hafta sonu ve resmi tatillerde de çalışıyoruz.',
    },
    {
      q: 'Ödemeyi nasıl yapabilirim?',
      a: 'Nakit, banka kartı, kredi kartı ve havale/EFT ile ödeme yapabilirsiniz.',
    },
  ] satisfies Faq[],

  /** Footer imzası */
  credit: {
    before: 'Bu site ',
    name: 'Allby Tech',
    url: 'https://www.allbytech.com/',
    after: ' tarafından hazırlanmıştır.',
  },
}

export type Site = typeof site

/** Sayfa içi bölüm bağlantıları */
export const nav = [
  { href: '#hizmetler', label: 'Hizmetler' },
  { href: '#bolgeler', label: 'Bölgeler' },
  { href: '#nasil-calisir', label: 'Nasıl çalışır' },
  { href: '#galeri', label: 'Galeri' },
  { href: '#iletisim', label: 'İletişim' },
  { href: '#sss', label: 'SSS' },
]
