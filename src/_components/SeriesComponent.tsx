import { Box, Button, Grid2 as Grid } from '@mui/material';
import { BookSeries, useBookLibrary } from '../_services';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const SeriesComponent = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
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
    <Box display="flex" flexDirection="column" rowGap="1rem" marginTop="1rem">
      <Button variant="outlined" href="/">
        Home
      </Button>
      <Grid container spacing={2}>
        {bookSeries.books.map((b) => {
          return (
            <Grid size={{ xs: 4, md: 3 }}>
              <img
                src={`data:image/png;base64,${b.faceB64}`}
                alt={b.name}
                width="100%"
                loading="lazy"
                onClick={() => navigate(`/series/${seriesId}/book/${b.id}`)}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
