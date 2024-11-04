import { Backdrop, IconButton, Slider, Typography } from '@mui/material';
import { useState } from 'react';
import { iOSIsInstalled } from '../_services';
import CloseIcon from '@mui/icons-material/Close';

const SHOW_CONTROL_THRETHOULD = 0.2;
const NEXT_PREV_THRETHOULD = 0.25;

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
  toPage: (pageIndex: number) => void;
  onClose: () => void;
}>) => {
  const [isShowControl, setIsShowControl] = useState(false);
  const handlePageClick = (xR: number, yR: number) => {
    if (yR <= SHOW_CONTROL_THRETHOULD || 1 - SHOW_CONTROL_THRETHOULD <= yR) {
      setIsShowControl(true);
    } else if (xR <= NEXT_PREV_THRETHOULD) {
      next();
    } else if (1 - NEXT_PREV_THRETHOULD <= xR) {
      prev();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,

        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        height: '100%',
        maxHeight: '100%',
        width: '100%',
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const p = {
          x: e.nativeEvent.offsetX / rect.width,
          y: e.nativeEvent.offsetY / rect.height,
        };

        handlePageClick(p.x, p.y);
      }}
    >
      <div
        style={{
          gridColumn: '1/2',
          gridRow: '1/2',
          overflow: 'hidden',

          height: '100%',
          width: '100%',
        }}
      >
        {children}
      </div>

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
          height: '100%',
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onHide();
          }}
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
