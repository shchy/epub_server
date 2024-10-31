import { useEffect, useState } from 'react';
import { CreateEpubController, Epub, EpubController } from '../_services';
import { PageComponent } from './PageComponent';
import { CircularProgress, Stack } from '@mui/material';

interface PageState {
  index: number;
  html?: HTMLHtmlElement;
}

export const BookComponent = ({ epub }: { epub: Epub }) => {
  const [epubCtrl, setEpubCtrl] = useState<EpubController>();
  const [pages, setPages] = useState<PageState[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageHtml, setCurrentPageHtml] = useState<string>();

  // const windowSize = useScreenSize();
  // const isHorizontal = useMemo(
  //   () => windowSize.width > windowSize.height,
  //   [windowSize]
  // );

  useEffect(() => {
    (async () => {
      const ctrl = CreateEpubController(epub);
      setEpubCtrl(ctrl);
      setPages(
        epub.spine.map((_, i) => ({
          index: i,
        }))
      );
    })();
  }, [epub]);

  useEffect(() => {
    (async () => {
      if (!epubCtrl) return;
      if (pages.length === 0) return;
      if (currentPage < 0 || pages.length <= currentPage) return;

      for (const page of pages) {
        const isCurrent = page.index === currentPage;
        const isPreLoad = Math.abs(page.index - currentPage) < 3;

        if (isPreLoad) {
          if (!page.html) {
            page.html = await epubCtrl.getPage(page.index);
          }
          if (isCurrent && page.html) {
            setCurrentPageHtml(page.html.outerHTML);
          }
        } else {
          page.html = undefined;
        }
      }
    })();
  }, [epubCtrl, pages, currentPage]);

  if (epubCtrl === undefined) {
    return (
      <Stack direction="column" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
      }}
    >
      <div style={{ height: '100px' }}>Header</div>

      <div
        style={{
          flex: '1',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row-reverse',
          justifyContent: 'center',
        }}
      >
        {currentPageHtml ? (
          <PageComponent page={currentPageHtml} />
        ) : (
          <p>not found</p>
        )}
      </div>

      <div style={{ height: '100px' }}>
        <button onClick={() => setCurrentPage(currentPage + 1)}>next</button>
      </div>
    </div>
  );
};
