import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SizeFitComponent } from './SizeFitComponent';
import { useBookLibrary } from '../_services';

const PRE_LOAD_SIZE = 3;

export interface PageProp {
  bookId: string;
  index: number;
  currentPage: number;
}
export const PageComponent = ({ bookId, index, currentPage }: PageProp) => {
  const { getBookPage } = useBookLibrary();
  const [htmlPage, setHtmlPage] = useState<string>();
  const isShow = useMemo(() => currentPage === index, [currentPage, index]);

  useEffect(() => {
    (async () => {
      const isPreload = Math.abs(currentPage - index) < PRE_LOAD_SIZE;
      if (!isPreload) {
        setHtmlPage(undefined);
        return;
      } else if (htmlPage !== undefined) {
        return;
      }
      try {
        const html = await getBookPage(bookId, index);
        setHtmlPage(html);
      } catch (err) {
        alert(err);
      }
    })();
  }, [bookId, index, currentPage, htmlPage, getBookPage]);

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
