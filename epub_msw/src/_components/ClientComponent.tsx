import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { BookComponent } from './BookComponent';
import { CreateEpub, Epub, useEpubStore } from '../_services';
const epubFileName = '618908_001_SPY×FAMILY 1.epub';

export const ClientComponent = () => {
  const [epub, setEpub] = useState<Epub>();
  const { getBook, putBook } = useEpubStore();

  useEffect(() => {
    (async () => {
      const file = await getBook(epubFileName);
      if (file) {
        setEpub(file.epub);
        return;
      }

      const response = await fetch(`./books/${epubFileName}`);
      const data = await response.arrayBuffer();
      setEpub(
        (
          await putBook({
            name: epubFileName,
            epub: CreateEpub(new Uint8Array(data)),
          })
        ).epub
      );
    })();
  }, [setEpub, getBook, putBook]);

  return (
    <Box sx={{ background: 'blue' }}>
      {epub ? (
        <BookComponent epub={epub} />
      ) : (
        <>
          <CircularProgress />
        </>
      )}
    </Box>
  );
};
