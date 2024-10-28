import { useEffect, useState } from 'react';
import { Stack, CircularProgress } from '@mui/material';
import { CreateEpubController, Epub } from '../_services';
import { PageComponent } from './PageComponent';

export const BookComponent = ({ epub }: { epub: Epub }) => {
  const [page, setPage] = useState(0);
  const [epubCtrl, setEpubCtrl] = useState(CreateEpubController(epub));

  useEffect(() => {
    (async () => {
      setEpubCtrl(epubCtrl);
    })();
  }, [epubCtrl]);

  return epub ? (
    // <Stack direction="column">
    <PageComponent controller={epubCtrl} page={page} />
  ) : (
    // </Stack>
    <CircularProgress />
  );
};
