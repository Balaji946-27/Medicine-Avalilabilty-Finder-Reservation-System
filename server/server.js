
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://medicine-availability-finder-reserv.vercel.app',
  'https://medicine-availability-finder-reservation-system-pea84oxk3.vercel.app',
  'https://medicine-availability-git-6acbe3-babalala1231412-3360s-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error('CORS blocked origin:', origin);
    return callback(new Error('CORS policy: Not allowed by CORS'));
  },
  credentials: true,
}));

