import { Box } from '@mui/material';
import { BookSeries, OpenRecent, useBookLibrary } from '../_services';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteCacheButton } from './DeleteCacheButton';
import { HorizontalList } from './HorizontalList';

export const HomeComponent = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState<BookSeries[]>([]);
  const [recents, setRecents] = useState<OpenRecent[]>([]);
  const { getSeries, listRecents } = useBookLibrary();
  const books = useMemo(
    () =>
      series.flatMap((x) =>
        x.books.map((b) => ({
          ...b,
          series: x,
        }))
      ),
    [series]
  );

  useEffect(() => {
    (async () => {
      setSeries(await getSeries());
    })();
  }, [getSeries]);

  useEffect(() => {
    (async () => {
      setRecents(await listRecents());
    })();
  }, [listRecents]);

  return (
    <Box display="flex" flexDirection="column" rowGap="1rem" marginTop="1rem">
      {recents.length > 0 && (
        <HorizontalList
          name="最近読んだ本"
          list={recents}
          itemWidth="128px"
          element={({ item }) => {
            const book = books.find((x) => x.id === item.bookId);
            if (!book) return <></>;
            return (
              <img
                src={`data:image/png;base64,${book.faceB64}`}
                alt={book.name}
                width="100%"
                loading="lazy"
                onClick={() =>
                  navigate(
                    `/series/${book.series.id}/book/${book.id}?page=${item.pageIndex}`
                  )
                }
              />
            );
          }}
        />
      )}

      {series.map((s) => (
        <HorizontalList
          key={s.id}
          name={s.name}
          list={s.books}
          itemWidth="128px"
          element={({ item }) => {
            return (
              <img
                src={`data:image/png;base64,${item.faceB64}`}
                alt={item.name}
                width="100%"
                loading="lazy"
                onClick={() => navigate(`/series/${s.id}/book/${item.id}`)}
              />
            );
          }}
        />
      ))}

      <DeleteCacheButton />
    </Box>
  );
};
