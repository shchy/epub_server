import { Box } from '@mui/material';
import { BookSeries, useBookLibrary } from '../_services';
import { useEffect, useState } from 'react';

export const HomeComponent = () => {
  const [series, setSeries] = useState<BookSeries[]>([]);
  const { getSeries } = useBookLibrary();

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
      {series.map((s) => {
        return (
          <div key={s.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <a key={s.id} href={`/series/${s.id}`}>
              {s.name}
            </a>
            <button onClick={clearCache}>clear cache</button>
          </div>
        );
      })}
    </Box>
  );
};
