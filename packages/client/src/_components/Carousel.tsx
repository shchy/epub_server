import { useEffect, useRef, useState } from 'react'

export const Carousel = <T,>({
  list,
  element,
  currentIndex,
  onChangeIndex,
  direction,
  itemHeight,
  itemWidth,
}: {
  list: T[]
  element: React.FC<{ item: T }>
  currentIndex?: number
  onChangeIndex?: (index: number) => void
  direction?: 'ltr' | 'rtl'
  itemWidth?: string
  itemHeight?: string
}) => {
  const parentElement = useRef<HTMLDivElement>(null)
  const [observer, setObserver] = useState<IntersectionObserver>()
  useEffect(() => {
    const parent = parentElement.current
    if (!parent) return

    const callback: IntersectionObserverCallback = (entrys) => {
      for (const entry of entrys) {
        if (entry.isIntersecting && onChangeIndex) {
          const index = Array.from(parent.children).indexOf(entry.target)
          onChangeIndex(index)
        }
      }
    }

    const observer = new IntersectionObserver(callback, {
      root: parent,
      rootMargin: '0px',
      threshold: 1.0,
    })

    setObserver(observer)
    return () => observer.disconnect()
  }, [onChangeIndex])

  useEffect(() => {
    if (!currentIndex) return
    const parent = parentElement.current
    if (!parent) return
    const target = Array.from(parent.children)[currentIndex]
    if (!target) return

    target.scrollIntoView()
  }, [currentIndex])

  return (
    <div
      ref={parentElement}
      style={{
        width: '100%',
        height: '100%',
        overflowX: 'scroll',
        overflowY: 'hidden',
        scrollSnapType: 'x mandatory',
        whiteSpace: 'nowrap',
        direction: direction ?? 'ltr',
      }}
    >
      {list.map((item, i) => {
        return (
          <CarouselItem
            key={i}
            observer={observer}
            itemHeight={itemHeight}
            itemWidth={itemWidth}
          >
            {element({ item })}
          </CarouselItem>
        )
      })}
    </div>
  )
}

export const CarouselItem = ({
  itemHeight,
  itemWidth,
  observer,
  children,
}: React.PropsWithChildren<{
  itemWidth?: string
  itemHeight?: string
  observer?: IntersectionObserver
}>) => {
  const targetElement = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!targetElement.current) return
    if (!observer) return
    observer.observe(targetElement.current)
  }, [observer, targetElement])

  return (
    <div
      ref={targetElement}
      style={{
        display: 'inline-block',
        width: itemWidth ?? '100%',
        height: itemHeight ?? '100%',
        scrollSnapAlign: 'center',
      }}
    >
      {children}
    </div>
  )
}
