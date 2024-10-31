import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';

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
    <div
      dir={option.direction}
      style={{ margin: 'auto', width: '100%', height: '100%' }}
    >
      <div
        ref={emblaRef}
        style={{ overflow: 'hidden', width: '100%', height: '100%' }}
      >
        <div
          style={{
            display: 'flex',
            touchAction: 'pan-y pinch-zoom',
            marginLeft: `calc(${slideSpacing} * -1)`,
            width: '100%',
            height: '100%',
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
