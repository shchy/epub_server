import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2 as Grid,
} from '@mui/material';
import { BookSeries, useBookLibrary } from '../_services';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const HomeComponent = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState<BookSeries[]>([]);
  const { getSeries } = useBookLibrary();

  const [isShowConfirmClear, setIsShowConfirmClear] = useState(false);
  const clearCache = async () => {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }
  };

  useEffect(() => {
    (async () => {
      setSeries(await getSeries());
    })();
  }, [getSeries]);

  return (
    <Box display="flex" flexDirection="column" rowGap="1rem" marginTop="1rem">
      <Grid container spacing={2}>
        {series.map((s) => {
          const bookface = s.books[0].faceB64;
          return (
            <Grid key={s.id} size={{ xs: 4, md: 3 }}>
              <img
                src={`data:image/png;base64,${bookface}`}
                alt={s.name}
                width="100%"
                loading="lazy"
                onClick={() => navigate(`/series/${s.id}`)}
              />
            </Grid>
          );
        })}
      </Grid>

      <Button
        variant="contained"
        color="error"
        onClick={() => setIsShowConfirmClear(true)}
      >
        clear cache
      </Button>
      <Dialog
        open={isShowConfirmClear}
        onClose={() => setIsShowConfirmClear(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'ダウンロードデータ削除'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ダウンロードデータが消えちゃうけどいいですか
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsShowConfirmClear(false)} autoFocus>
            よくない
          </Button>
          <Button
            onClick={() => {
              clearCache();
              setIsShowConfirmClear(false);
            }}
          >
            よい
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
