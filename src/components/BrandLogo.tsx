import Image from 'next/image'

interface BrandLogoProps {
  size?: number
  className?: string
  priority?: boolean
}

export default function BrandLogo({
  size = 32,
  className = '',
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/images/markets-finance-monogram-v2.png"
      alt="Markets & Finance"
      width={size}
      height={size}
      priority={priority}
      className={`shrink-0 object-cover ${className}`}
    />
  )
}
