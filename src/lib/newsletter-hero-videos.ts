export type NewsletterHeroVideo = {
  desktop: string
  mobile: string
  poster: string
}

const NEWSLETTER_HERO_VIDEOS: Record<string, NewsletterHeroVideo> = {
  economiaentredosfuerzas: {
    desktop: '/video/newsletters/economiaentredosfuerzas.mp4',
    mobile: '/video/newsletters/economiaentredosfuerzas-mobile.mp4',
    poster: '/video/newsletters/economiaentredosfuerzas-poster.jpg',
  },
  mercadomiradatiposinteres: {
    desktop: '/video/newsletters/mercadomiradatiposinteres.mp4',
    mobile: '/video/newsletters/mercadomiradatiposinteres-mobile.mp4',
    poster: '/video/newsletters/mercadomiradatiposinteres-poster.jpg',
  },
  'wall-street-oro-petroleo-nuevo-ciclo-financiero': {
    desktop: '/video/newsletters/wall-street-oro-petroleo-nuevo-ciclo-financiero.mp4',
    mobile: '/video/newsletters/wall-street-oro-petroleo-nuevo-ciclo-financiero-mobile.mp4',
    poster: '/video/newsletters/wall-street-oro-petroleo-nuevo-ciclo-financiero-poster.jpg',
  },
}

export function getNewsletterHeroVideo(slug: string) {
  return NEWSLETTER_HERO_VIDEOS[slug]
}
