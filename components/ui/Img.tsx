// components/ui/Img.tsx
// Google CDN (lh3.googleusercontent.com) görselleri için referrer sorununu çözer
// Tüm <img> tag'ları yerine bunu kullan

interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string
}

export function Img({ src, alt = '', fallback, onError, ...props }: ImgProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement
    if (fallback) {
      target.src = fallback
    } else {
      target.style.display = 'none'
    }
    onError?.(e)
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={handleError}
      {...props}
    />
  )
}
