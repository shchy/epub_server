import { Container } from '@mui/material';
import { ClientComponent } from './_components/ClientComponent';

function App() {
  return (
    <Container fixed sx={{ height: '100vh' }}>
      <ClientComponent />
    </Container>
  );
}

export default App;
