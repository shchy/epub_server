import { HttpResponse, http } from 'msw';

export const setupMsw = async () => {
  if (typeof window !== 'undefined') {
    const { setupWorker } = await import('msw/browser');

    const worker = setupWorker(
      ...[
        http.all('/*', (e) => {
          console.log(e.request.url);
        }),
        http.get('/example', () => {
          return HttpResponse.json({ user: { name: 'hanako' } });
        }),
      ]
    );
    worker.start();
    console.log('start msw');
  }
};
