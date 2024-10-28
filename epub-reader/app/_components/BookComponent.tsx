import { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { CreateEpubController, Epub, EpubController } from '../_services';
import { PageComponent } from './PageComponent';

export const BookComponent = ({ epub }: { epub: Epub }) => {
  const [page, setPage] = useState(0);
  const [epubCtrl, setEpubCtrl] = useState<EpubController>();

  useEffect(() => {
    (async () => {
      const ctrl = CreateEpubController(epub);
      setEpubCtrl(ctrl);
      setPage(0);
    })();
  }, [epub]);

  return epubCtrl ? (
    // <Stack direction="column">
    <PageComponent controller={epubCtrl} page={page} />
  ) : (
    // </Stack>
    <CircularProgress />
  );
};
