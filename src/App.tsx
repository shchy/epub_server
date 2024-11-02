import {
  Backdrop,
  Box,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';
import { BookLibraryProvider, useLoading } from './_services';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { HomeComponent } from './_components/HomeComponent';
import { SeriesComponent } from './_components/SeriesComponent';
import { BookComponent } from './_components/BookComponent';
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeComponent />,
  },
  {
    path: '/series/:seriesId',
    element: <SeriesComponent />,
  },
  {
    path: '/series/:seriesId/book/:bookId',
    element: <BookComponent />,
  },
  {
    path: '/*',
    element: <Navigate to="/" />,
  },
]);

function App() {
  const { isLoading, progress } = useLoading();
  return (
    <BookLibraryProvider>
      <Container fixed sx={{ height: '100vh' }}>
        <RouterProvider router={router} />
      </Container>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={isLoading}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            size="5rem"
            variant={progress === undefined ? undefined : 'determinate'}
            value={(progress ?? 0) * 100}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {progress !== undefined && (
              <Typography
                variant="caption"
                component="div"
                sx={{ color: 'text.secondary' }}
              >{`${Math.round((progress ?? 0) * 100)}%`}</Typography>
            )}
          </Box>
        </Box>
      </Backdrop>
    </BookLibraryProvider>
  );
}

export default App;
