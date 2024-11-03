import { useNavigate, useParams } from 'react-router-dom';
import { PageComponent, PageProp } from './PageComponent';
import { useBookLibrary, useLoading } from '../_services';
import { useEffect, useState } from 'react';
import { Backdrop, IconButton, Slider, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const BookComponent = () => {
  const navigate = useNavigate();
  const { seriesId, bookId } = useParams();
  const { loading } = useLoading();
  const { epubDownload, getBook } = useBookLibrary();
  const [pages, setPages] = useState<Omit<PageProp, 'currentPage'>[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [title, setTitle] = useState('');

  const [isShowControl, setIsShowControl] = useState(false);

  useEffect(() => {
    loading(async (setProgress) => {
      if (!bookId) return;
      // ダウンロード
      await epubDownload(bookId, setProgress);

      const book = await getBook(bookId);
      if (!book) {
        setPages([]);
        return;
      }
      setTitle(book.name);

      const pages = [...Array(book.pageCount).keys()].map<
        Omit<PageProp, 'currentPage'>
      >((i) => ({
        bookId: bookId,
        index: i,
      }));
      setPages(pages);
    });
  }, []);

  const toPage = async (pageIndex: number) => {
    if (pageIndex < 0 || pages.length <= pageIndex) return;
    setCurrentPage(pageIndex);
  };

  const next = async () => {
    toPage(currentPage + 1);
  };

  const prev = async () => {
    toPage(currentPage - 1);
  };

  const handlePageClick = (xR: number, yR: number) => {
    if (0.2 <= yR && yR <= 0.8) {
      if (xR <= 0.5) next();
      else prev();
      return;
    }
    setIsShowControl(true);
  };

  if (!bookId) return <></>;
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
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row-reverse',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {pages.map((p) => {
          return (
            <PageComponent key={p.index} {...p} currentPage={currentPage} />
          );
        })}
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
        pageCount={pages.length}
        onClose={() => navigate(`/series/${seriesId}`)}
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
          gridTemplateRows: '6rem 1fr 6rem',
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
            padding: '3rem 1rem 0 1rem',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            sx={{ color: 'text.primary', gridColumn: '2/3' }}
          >
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            sx={{ gridColumn: '3/4' }}
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
            padding: '0 1rem 3rem 1rem',
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
