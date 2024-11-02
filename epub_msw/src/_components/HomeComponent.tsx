import { Box } from '@mui/material';
import { useBookLibrary } from '../_services';

export const HomeComponent = () => {
  const { series, clearCache } = useBookLibrary();

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
