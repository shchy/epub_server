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
      series
        .flatMap((x) =>
          x.books.map((b) => ({
            ...b,
            series: x,
          }))
        )
        .sort((a, b) => {
          if (!a.addDate && !b.addDate) return 0;
          else if (!a.addDate) return 1;
          else if (!b.addDate) return -1;
          else if (a.addDate === b.addDate) return 0;
          return a.addDate - b.addDate < 0 ? -1 : 1;
        }),
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
                src={book.thumbnailPath}
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

      {recents.length > 0 && (
        <HorizontalList
          name="追加された本"
          list={books.slice(0, 30)}
          itemWidth="128px"
          element={({ item }) => {
            return (
              <img
                src={item.thumbnailPath}
                alt={item.name}
                width="100%"
                loading="lazy"
                onClick={() =>
                  navigate(`/series/${item.series.id}/book/${item.id}`)
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
                src={item.thumbnailPath}
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
