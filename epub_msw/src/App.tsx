import { Container } from '@mui/material';
import { BookLibraryProvider } from './_services';
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
    path: '/book/:bookId',
    element: <BookComponent />,
  },
  {
    path: '/*',
    element: <Navigate to="/" />,
  },
]);

function App() {
  return (
    <BookLibraryProvider>
      <Container fixed sx={{ height: '100vh' }}>
        <RouterProvider router={router} />
      </Container>
    </BookLibraryProvider>
  );
}

export default App;
