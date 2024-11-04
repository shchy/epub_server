import { useNavigate, useParams } from 'react-router-dom';
import { PageComponent, PageProp } from './PageComponent';
import { useBookLibrary, useLoading } from '../_services';
import { useEffect, useState } from 'react';

import { BookFrame } from './BookFrame';
import { Carousel } from './Carousel';

export const BookComponent = () => {
  const navigate = useNavigate();
  const { bookId } = useParams();
  const { loading } = useLoading();
  const { epubDownload, getBook } = useBookLibrary();
  const [pages, setPages] = useState<Omit<PageProp, 'currentPage'>[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [title, setTitle] = useState('');

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

  const toPage = (pageIndex: number) => {
    if (pageIndex < 0 || pages.length <= pageIndex) return;
    setCurrentPage(pageIndex);
  };

  const next = async () => {
    toPage(currentPage + 1);
  };

  const prev = async () => {
    toPage(currentPage - 1);
  };

  if (!bookId) return <></>;
  return (
    <BookFrame
      currentPage={currentPage}
      next={next}
      prev={prev}
      onClose={() => navigate(`/`)}
      pageCount={pages.length}
      title={title}
      toPage={toPage}
    >
      <Carousel
        list={pages}
        currentIndex={currentPage}
        onChangeIndex={toPage}
        direction="rtl"
        element={({ item }) => {
          return (
            <PageComponent
              key={item.index}
              {...item}
              currentPage={currentPage}
            />
          );
        }}
      />
    </BookFrame>
  );
};
