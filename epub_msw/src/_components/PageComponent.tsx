import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SizeFitComponent } from './SizeFitComponent';
import { APIPath, Book } from '../_services';

export interface PageProp {
  book: Book;
  index: number;
  currentPage: number;
}
export const PageComponent = ({ book, index, currentPage }: PageProp) => {
  const [htmlPage, setHtmlPage] = useState<string>();
  const isShow = useMemo(() => currentPage === index, [currentPage, index]);

  useEffect(() => {
    (async () => {
      const isPreload = Math.abs(currentPage - index) < 3;
      if (!isPreload) {
        setHtmlPage(undefined);
        return;
      } else if (htmlPage !== undefined) {
        return;
      }
      const url = APIPath.getBookPage
        .replace(':id', book.id)
        .replace(':page', index.toString());
      const res = await fetch(url);
      const html = await res.text();
      setHtmlPage(html);
    })();
  }, [book, index, currentPage, htmlPage]);

  if (!htmlPage) {
    return <></>;
  }

  return <PageHolderComponent page={htmlPage} isShow={isShow} />;
};

export const PageHolderComponent = ({
  page,
  isShow,
}: {
  page: string;
  isShow: boolean;
}) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const [frameSize, setFrameSize] = useState<Pick<DOMRect, 'width' | 'height'>>(
    {
      width: 0,
      height: 0,
    }
  );
  const updateSize = useCallback(() => {
    const iframe = frame.current;
    if (!iframe) return;
    const frameBody = iframe.contentWindow?.document.body;
    if (!frameBody) return;
    // スクロールさせない
    frameBody.style.position = 'fixed';
    frameBody.style.overflow = 'hidden';

    setFrameSize(frameBody.getBoundingClientRect());
  }, []);

  useEffect(() => {
    const iframe = frame.current;
    if (!iframe) return;

    iframe.onload = () => updateSize();
    updateSize();
  }, [frame, page, updateSize]);

  useEffect(() => {
    updateSize();
  }, [isShow]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: isShow ? undefined : 'none',
      }}
    >
      <SizeFitComponent isHide={!isShow}>
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
  );
};
