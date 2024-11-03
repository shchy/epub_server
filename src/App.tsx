import { Container } from '@mui/material';
import { BookLibraryProvider, useLoading } from './_services';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { HomeComponent } from './_components/HomeComponent';
import { SeriesComponent } from './_components/SeriesComponent';
import { BookComponent } from './_components/BookComponent';
import { LoadingComponent } from './_components/LoadingComponent';
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
      <LoadingComponent isLoading={isLoading} progress={progress} />
    </BookLibraryProvider>
  );
}

export default App;
