'use client'

import SpiralGallery from '../../components/SpiralGallery'

const DEFAULTS = {
  title: 'Moments',
  subtitle: '',
  images: [],
}

export default function Gallery(props) {
  const { title, subtitle, images } = { ...DEFAULTS, ...props }

  const photos = images.map((image, index) => ({
    id: image.id ?? index,
    src: image.src,
    alt: image.caption || image.alt || `Gallery photo ${index + 1}`,
  }))

  return (
    <SpiralGallery
      photos={photos}
      ariaLabel="Gallery"
      eyebrow="A glimpse of us"
      title={title}
      subtitle={subtitle}
    />
  )
}
