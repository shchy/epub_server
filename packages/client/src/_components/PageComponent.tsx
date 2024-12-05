import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SizeFitComponent } from './SizeFitComponent'
import { useBookLibrary } from '../_services'

export interface PageProp {
  bookId: string
  index: number
  currentPage: number
}
export const PageComponent = ({ bookId, index, currentPage }: PageProp) => {
  const { getBookPage, PAGE_CACHE_SIZE } = useBookLibrary()
  const [htmlPage, setHtmlPage] = useState<string>()
  const isPreload = useMemo(
    () => Math.abs(currentPage - index) < PAGE_CACHE_SIZE / 2 - 1,
    [currentPage, index, PAGE_CACHE_SIZE],
  )
  const hasHtml = useMemo(() => htmlPage !== undefined, [htmlPage])

  useEffect(() => {
    ;(async () => {
      if (!isPreload && hasHtml) {
        setHtmlPage(undefined)
      } else if (isPreload && !hasHtml) {
        const html = await getBookPage(bookId, index)
        setHtmlPage(html)
      }
    })()
  }, [bookId, isPreload, hasHtml, getBookPage, index])

  if (!htmlPage) {
    return <></>
  }

  return <PageHolderComponent page={htmlPage} />
}

export const PageHolderComponent = ({ page }: { page: string }) => {
  const frame = useRef<HTMLIFrameElement>(null)
  const [frameSize, setFrameSize] = useState<Pick<DOMRect, 'width' | 'height'>>(
    {
      width: 0,
      height: 0,
    },
  )
  const updateSize = useCallback(() => {
    const iframe = frame.current
    if (!iframe) return
    const frameBody = iframe.contentWindow?.document.body
    if (!frameBody) return
    // スクロールさせない
    frameBody.style.position = 'fixed'
    frameBody.style.overflow = 'hidden'

    setFrameSize(frameBody.getBoundingClientRect())
  }, [])

  useEffect(() => {
    const iframe = frame.current
    if (!iframe) return

    iframe.onload = () => updateSize()
    updateSize()
  }, [frame, page, updateSize])

  useEffect(() => {
    updateSize()
  }, [updateSize])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <SizeFitComponent>
          <iframe
            ref={frame}
            srcDoc={page}
            style={{
              border: 'none',
              overflow: 'hidden',
            }}
            width={frameSize.width}
            height={frameSize.height}
          />
        </SizeFitComponent>
      </div>
      <div
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      ></div>
    </div>
  )
}
