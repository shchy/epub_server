import { useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';
import {
  CreateEpubController,
  Epub,
  EpubController,
  useImageSize,
  ImageSize,
  // useScreenSize,
  useElementSize,
} from '../_services';
import { PageComponent } from './PageComponent';

export const BookComponent = ({ epub }: { epub: Epub }) => {
  // const [page, setPage] = useState(0);
  const [pages, setPages] = useState<React.ReactNode[]>([]);
  const [epubCtrl, setEpubCtrl] = useState<EpubController>();
  const { size: orgSize, setImageData } = useImageSize();
  const { parentRef, targetRef } = useFixElement();

  // const windowSize = useScreenSize();
  // const isHorizontal = useMemo(
  //   () => windowSize.width > windowSize.height,
  //   [windowSize]
  // );

  const resolvedSize = useMemo<ImageSize | undefined>(() => {
    if (!orgSize) return;
    const originalResolution = epubCtrl?.originalResolution;
    if (!originalResolution) return;
    // 画像の実サイズとEpubが言ってるサイズをマージして解決する
    // Heightの比で実サイズを拡縮する
    const r = originalResolution.height / orgSize.height;
    return {
      width: orgSize.width * r,
      height: orgSize.height * r,
    };
  }, [orgSize, epubCtrl]);

  useEffect(() => {
    (async () => {
      const ctrl = CreateEpubController(epub);
      setEpubCtrl(ctrl);
      // setPage(0);
    })();
  }, [epub]);

  useEffect(() => {
    (async () => {
      if (!epubCtrl) return;
      setPages(
        epub.spine
          .slice(0, 5)
          .map((x, i) => (
            <PageComponent key={i} controller={epubCtrl} page={i} />
          ))
      );
      const coverImage = epubCtrl.getCoverImage();
      if (!coverImage) return;
      setImageData(coverImage);
    })();
  }, [epub, epubCtrl, setPages, setImageData]);

  return (
    <div
      ref={parentRef}
      style={{ width: '100%', height: '100vh', overflow: 'hidden' }}
    >
      <div ref={targetRef}>
        <Carousel
          slides={pages}
          slideHeight={resolvedSize ? `${resolvedSize.height}px` : '100%'}
          slideSize={resolvedSize ? `${resolvedSize.width}px` : '100%'}
          slideSpacing="0"
          option={{
            direction: 'rtl',
          }}
        />
      </div>
    </div>
  );
};

// TODO ⭐️Componentにして子要素をtargetにしたほうがいいかも
export const useFixElement = () => {
  const { ref: parentRef, size: parentSize } = useElementSize();
  const { ref: targetRef, size: targetSize } = useElementSize();

  useEffect(() => {
    if (!targetRef.current) return;

    // サイズが確定してなかったら処理しない
    if (
      targetSize.scroll.width === 0 ||
      targetSize.scroll.height === 0 ||
      parentSize.client.width === 0 ||
      parentSize.client.height === 0
    )
      return;

    // 親枠の領域に合わせるため、縦横大きくはみ出てる方に合わせる
    const wDiff = parentSize.client.width - targetSize.scroll.width;
    const hDiff = parentSize.client.height - targetSize.scroll.height;
    const wR = parentSize.client.width / targetSize.scroll.width;
    const hR = parentSize.client.height / targetSize.scroll.height;
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

    // 親フレームに合わせて拡縮
    targetRef.current.style.transform = `scale(${r})`;
    targetRef.current.style.transformOrigin = 'top left';
  }, [parentSize, targetSize, targetRef]);

  return {
    parentRef,
    targetRef,
  };
};

export const Carousel = ({
  slides,
  slideHeight,
  slideSize,
  slideSpacing,
  option,
}: {
  slides: React.ReactNode[];
  slideHeight: string;
  slideSpacing: string;
  slideSize: string;
  option: EmblaOptionsType;
}) => {
  const [emblaRef] = useEmblaCarousel(option);

  return (
    <div dir={option.direction} style={{ margin: 'auto' }}>
      <div ref={emblaRef} style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            touchAction: 'pan-y pinch-zoom',
            marginLeft: `calc(${slideSpacing} * -1)`,
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              style={{
                transform: 'translate3d(0, 0, 0)',
                flex: `0 0 ${slideSize}`,
                minWidth: 0,
                paddingLeft: slideSpacing,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gridTemplateRows: '1fr',
                  height: slideHeight,
                  userSelect: 'none',
                  // background: i % 2 === 0 ? 'red' : 'blue',
                }}
              >
                <div
                  style={{
                    gridRow: '1/1',
                    gridColumn: '1/1',
                    userSelect: 'none',
                  }}
                >
                  {slide}
                </div>
                <div
                  style={{
                    gridRow: '1/1',
                    gridColumn: '1/1',
                    userSelect: 'none',
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
