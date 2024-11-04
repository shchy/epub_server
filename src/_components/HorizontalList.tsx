import { Box, Typography } from '@mui/material';
import { Carousel } from './Carousel';

export const HorizontalList = <T,>({
  name,
  list,
  element,
  itemHeight,
  itemWidth,
}: {
  name: string;
  list: T[];
  element: React.FC<{ item: T }>;
  itemWidth?: string;
  itemHeight?: string;
}) => {
  return (
    <Box display="flex" flexDirection="column" rowGap="1rem" marginTop="1rem">
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" component="h6">
          {name}
        </Typography>
      </Box>
      <Carousel
        list={list}
        itemWidth={itemWidth}
        itemHeight={itemHeight}
        element={element}
      />
    </Box>
  );
};
