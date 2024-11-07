import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useState } from 'react';

export const DeleteCacheButton = () => {
  const [isShowConfirmClear, setIsShowConfirmClear] = useState(false);
  const clearCache = async () => {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }
  };
  return (
    <>
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
    </>
  );
};
