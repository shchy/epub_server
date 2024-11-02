import { useParams } from 'react-router-dom';
import { PageComponent, PageProp } from './PageComponent';
import { useBookLibrary } from '../_services';
import { useEffect, useState } from 'react';

export const BookComponent = () => {
  const { bookId } = useParams();
  const { getBook } = useBookLibrary();
  const [pages, setPages] = useState<Omit<PageProp, 'currentPage'>[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    (async () => {
      if (!bookId) return;
      const ctrl = await getBook(bookId);
      if (!ctrl) {
        setPages([]);
        return;
      }
      if (!ctrl) return;

      const pages = [...Array(ctrl.pageCount).keys()].map<
        Omit<PageProp, 'currentPage'>
      >((i) => ({
        bookId: bookId,
        index: i,
      }));
      setPages(pages);
    })();
  }, [bookId, getBook]);

  const next = async () => {
    setCurrentPage(currentPage + 1);
  };

  if (!bookId) return <></>;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
      }}
    >
      <div style={{ height: '100px' }}>Header </div>

      <div
        style={{
          flex: '1',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row-reverse',
          justifyContent: 'center',
        }}
      >
        {pages.map((p) => {
          return (
            <PageComponent key={p.index} {...p} currentPage={currentPage} />
          );
        })}
      </div>

      <div style={{ height: '100px' }}>
        <button onClick={() => next()}>next</button>
      </div>
    </div>
  );
};
