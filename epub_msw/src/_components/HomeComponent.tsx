import { Box } from '@mui/material';
import { useBookLibrary } from '../_services';

export const HomeComponent = () => {
  const { series } = useBookLibrary();

  return (
    <Box>
      {series.map((s) => {
        return (
          <a key={s.id} href={`/series/${s.id}`}>
            {s.name}
          </a>
        );
      })}
    </Box>
  );
};
