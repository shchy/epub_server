'use client';
import { useEffect, useRef, useState } from 'react';
import { EpubController } from '../_services';

export const PageComponent = ({
  controller,
  page,
}: {
  controller: EpubController;
  page: number;
}) => {
  const [pageHtml, setPageHtml] = useState<string>();
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!controller) return;
    const html = controller.getPage(page);
    if (!html) return;
    setPageHtml(html.outerHTML);
  }, [controller, page]);

  useEffect(() => {
    const iframe = frame.current;
    if (!iframe) return;

    iframe.onload = () => updateSize(iframe);
    updateSize(iframe);
  }, [root, frame, pageHtml]);

  const updateSize = (iframe: HTMLIFrameElement) => {
    const frameBody = iframe.contentWindow?.document.body;
    if (!frameBody) return;
    if (!root.current) return;

    // 実サイズ
    const actSize = {
      w: frameBody.scrollWidth,
      h: frameBody.scrollHeight,
    };
    if (actSize.w === 0 || actSize.h === 0) return;

    // 親枠の領域に合わせるため、縦横大きくはみ出てる方に合わせる
    const wDiff = root.current.clientWidth - actSize.w;
    const hDiff = root.current.clientHeight - actSize.h;
    const wR = root.current.clientWidth / actSize.w;
    const hR = root.current.clientHeight / actSize.h;
    let r = 1.0;

    if (wDiff < 0 && hDiff < 0) {
      if (wDiff < hDiff) {
        r = wR;
      } else {
        r = hR;
      }
    } else if (wDiff < 0) {
      r = wR;
    }
    if (hDiff < 0) {
      r = hR;
    }

    if (r === 0) return;
    frameBody.style.transform = `scale(${r})`;
    frameBody.style.transformOrigin = 'top left';
    frameBody.style.position = 'fixed';

    setFrameSize({
      w: actSize.w * r,
      h: actSize.h * r,
    });
  };

  return (
    <div ref={root} style={{ width: '100%', height: '100%' }}>
      <iframe
        ref={frame}
        srcDoc={pageHtml}
        style={{
          border: 'none',
        }}
        width={frameSize.w}
        height={frameSize.h}
      />
    </div>
  );
};
