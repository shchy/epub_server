import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { BookSeries, useBookLibrary } from '../_services';
import { useEffect, useState } from 'react';
import React from 'react';
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
    <Box>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <List
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        >
          {series.map((s) => {
            const bookface = s.books[0].faceB64;

            return (
              <ListItemButton
                key={s.id}
                alignItems="flex-start"
                onClick={() => navigate(`/series/${s.id}`)}
                sx={{ flexDirection: 'column', alignItems: 'center' }}
              >
                <ListItem>
                  <img
                    src={`data:image/png;base64,${bookface}`}
                    alt={s.name}
                    width="100%"
                    loading="lazy"
                  />
                </ListItem>
                <ListItemText
                  primary={s.name}
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: 'text.primary', display: 'inline' }}
                      >
                        {`1〜${s.books.length}巻`}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
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
      </div>
    </Box>
  );
};
