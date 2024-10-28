import { Container } from '@mui/material';
import { ClientComponent } from './_components/ClientComponent';

export default function Home() {
  return (
    <div>
      <main>
        <Container fixed sx={{ height: '100vh' }}>
          <ClientComponent />
        </Container>
      </main>
    </div>
  );
}
