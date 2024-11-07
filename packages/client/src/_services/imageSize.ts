import { useEffect, useState } from 'react'

export interface ImageSize {
  width: number
  height: number
}

export const useImageSize = () => {
  const [data, setData] = useState<Uint8Array>()
  const [size, setSize] = useState<ImageSize>()

  useEffect(() => {
    ;(async () => {
      if (!data) return
      const srcB64 = `data:image/png;base64,${Buffer.from(data).toString(
        'base64',
      )}`
      const size = await new Promise<ImageSize>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
          })
        }
        img.onerror = () => reject()
        img.src = srcB64
      })
      setSize(size)
    })()
  }, [data])

  return {
    size,
    setImageData: setData,
  }
}
