import expressPkg from 'express';
import type { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';

const app = expressPkg();
const PORT = 3100;
const DELAY_MS = 2000;

app.use(expressPkg.json());
app.use(expressPkg.urlencoded({ extended: true }));

// CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  setTimeout(next, DELAY_MS);
});

app.get('/', (req: Request, res: Response<any>) => {
  res.json({
    message: 'Express сервер с задержкой',
    timestamp: new Date().toISOString(),
    delay: DELAY_MS,
  });
});

app.post('/api/token', (req: Request, res: Response<any>) => {
  console.log('req.body:', req.body);

  res.json({
    access_token: nanoid(),
    expires_in: 120,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Express сервер запущен на порту ${PORT}`);
  console.log(`Задержка ответов: ${DELAY_MS}мс`);
});
