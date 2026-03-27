import expressPkg from 'express';
import type { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { ASSETS } from './mock/asset.ts';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { fileURLToPath } from 'url';

const app = expressPkg();
const PORT = 3100;
const DELAY_MS = 2000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.get('/api/assets', (req: Request, res: Response<any>) => {
  res.json(ASSETS);
});

app.get('/api/assets/:uid', (req: Request, res: Response<any>) => {
  res.json(ASSETS.Page[0]);
});

app.post('/api/files/outbox', (req: Request, res: Response<any>) => {
  res.json(nanoid());
});

app.get('/api/v1/files/outbox/:uid', (req, res) => {
  const { uid } = req.params;

  // для теста просто используем файл из локальной папки
  const filePath = path.join(__dirname, 'files', `Appendix_2.pdf`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      message: 'File not found',
      uid,
    });
  }

  const stat = fs.statSync(filePath);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', stat.size);

  // важно — Content-Disposition как в реальном API
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(`${uid}.pdf`)}`);

  const stream = fs.createReadStream(filePath);

  stream.pipe(res);

  stream.on('error', (err) => {
    console.error(err);
    res.sendStatus(500);
  });
});

app.post('/api/orders/init', (req: Request, res: Response<any>) => {
  res.json({ OrderUid: nanoid() });
});

app.post('/api/orders/init/:uid/payment', (req: Request, res: Response<any>) => {
  res.json({ Uid: nanoid() });
});

app.post('/api/subscriptions', (req: Request, res: Response<any>) => {
  res.json({ EventSubscriptionUid: nanoid() });
});

app.get('/api/subscriptions/:uid/events', (req: Request, res: Response<any>) => {
  res.json({
    Events: [
      {
        Id: 9999,
        EventDate: new Date().toISOString(),
        ObjectType: 'Order',
        ObjectUid: 'hQuzrjBxg4wm5rRpFV-vy',
        EventType: 'OrderClosed',
        Data: JSON.stringify({ type: 'Init', status: 'Closed' }),
        Subject: nanoid(),
      },
    ],
    HasMore: false,
  });
});

app.listen(PORT, () => {
  console.log(`Express сервер запущен на порту ${PORT}`);
  console.log(`Задержка ответов: ${DELAY_MS}мс`);
});
