import { Backdrop, IconButton, Slider, Typography } from '@mui/material';
import { useState } from 'react';
import { iOSIsInstalled } from '../_services';
import CloseIcon from '@mui/icons-material/Close';

export const BookFrame = ({
  next,
  prev,
  toPage,
  onClose,
  title,
  pageCount,
  currentPage,
  children,
}: React.PropsWithChildren<{
  title: string;
  currentPage: number;
  pageCount: number;
  next: () => void;
  prev: () => void;
  toPage: (pageIndex: number) => Promise<void>;
  onClose: () => void;
}>) => {
  const [isShowControl, setIsShowControl] = useState(false);
  const handlePageClick = (xR: number, yR: number) => {
    if (0.2 <= yR && yR <= 0.8) {
      if (xR <= 0.5) next();
      else prev();
      return;
    }
    setIsShowControl(true);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        height: '100vh',
        width: '100%',
      }}
    >
      <div
        style={{
          gridColumn: '1/2',
          gridRow: '1/2',
          // overflow: 'hidden',

          // height: '100vh',
          // width: '100%',

          // display: 'flex',
          // flexDirection: 'row-reverse',
          // justifyContent: 'center',
          // alignItems: 'center',
          // direction: 'rtl',
        }}
      >
        {children}
      </div>
      <div
        style={{
          gridColumn: '1/2',
          gridRow: '1/2',
          zIndex: '1',
          position: 'absolute',
          top: '0',
          bottom: '0',
          left: '0',
          right: '0',
        }}
        onClick={(e) => {
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const p = {
            x: e.nativeEvent.offsetX / rect.width,
            y: e.nativeEvent.offsetY / rect.height,
          };

          handlePageClick(p.x, p.y);
        }}
      ></div>

      <BookControl
        currentPage={currentPage}
        isShow={isShowControl}
        onHide={() => setIsShowControl(false)}
        title={title}
        onPage={toPage}
        pageCount={pageCount}
        onClose={() => onClose()}
      />
    </div>
  );
};

export const BookControl = ({
  isShow,
  onHide,
  title,
  pageCount,
  currentPage,
  onPage,
  onClose,
}: {
  isShow: boolean;
  onHide: () => void;
  title: string;
  pageCount: number;
  currentPage: number;
  onPage: (pageIndex: number) => void;
  onClose: () => void;
}) => {
  return (
    <Backdrop
      sx={(theme) => ({
        color: '#fff',
        zIndex: theme.zIndex.drawer + 1,
      })}
      open={isShow}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gridTemplateRows: iOSIsInstalled ? '2rem 1fr 5rem' : '4rem 1fr 5rem',
          height: '100vh',
          width: '100%',
        }}
      >
        <div
          style={{
            gridColumn: '1/2',
            gridRow: '1/2',
            background: 'white',

            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            justifyItems: 'center',
            alignItems: 'center',
            gap: '1rem',
            padding: iOSIsInstalled ? '0rem 1rem 0 1rem' : '2rem 1rem 0 1rem',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            sx={{ color: 'text.primary', gridColumn: '1/4', gridRow: '1/2' }}
          >
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            sx={{ gridColumn: '3/4', gridRow: '1/2' }}
            onClick={onClose}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
        <div
          style={{
            gridColumn: '1/2',
            gridRow: '2/3',
          }}
          onClick={onHide}
        ></div>
        <div
          style={{
            gridColumn: '1/2',
            gridRow: '3/4',
            background: 'white',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            padding: iOSIsInstalled ? '0 1rem 3rem 1rem' : '0 1rem 3rem 1rem',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            sx={{ color: 'text.primary' }}
          >{`${currentPage + 1}/${pageCount}`}</Typography>

          <Slider
            sx={{ flex: '1' }}
            track="inverted"
            aria-label="Default"
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => (pageCount - (v as number)).toString()}
            value={pageCount - 1 - currentPage}
            onChange={(_, v) => onPage(pageCount - 1 - (v as number))}
            max={pageCount}
          />
        </div>
      </div>
    </Backdrop>
  );
};
