import { Box } from '@mui/material';
import { BookSeries, useBookLibrary } from '../_services';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const SeriesComponent = () => {
  const { seriesId } = useParams();
  const { getSeries } = useBookLibrary();
  const [bookSeries, setBookSeries] = useState<BookSeries>();

  useEffect(() => {
    (async () => {
      const series = (await getSeries()).find((x) => x.id === seriesId);
      if (!series) return;
      setBookSeries(series);
    })();
  }, [seriesId, getSeries, setBookSeries]);

  if (!bookSeries) {
    return <></>;
  }

  return (
    <Box>
      {bookSeries.books.map((b) => {
        return (
          <div
            key={b.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <a key={b.id} href={`/book/${b.id}`}>
              {b.name}
            </a>
          </div>
        );
      })}
    </Box>
  );
};
