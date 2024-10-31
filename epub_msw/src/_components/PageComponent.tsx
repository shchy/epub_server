import { useCallback, useEffect, useRef, useState } from 'react';
import { SizeFitComponent } from './SizeFitComponent';

export const PageComponent = ({ page }: { page: string }) => {
  // const [pageHtml, setPageHtml] = useState<string>();
  const frame = useRef<HTMLIFrameElement>(null);
  const [frameSize, setFrameSize] = useState<Pick<DOMRect, 'width' | 'height'>>(
    {
      width: 0,
      height: 0,
    }
  );
  const updateSize = useCallback((iframe: HTMLIFrameElement) => {
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
    iframe.onload = () => updateSize(iframe);
    updateSize(iframe);
  }, [frame, page, updateSize]);

  return (
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
  );
};
