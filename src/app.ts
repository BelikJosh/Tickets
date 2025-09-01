import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes'; // Importar routes index

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));            // Acepta hasta 5MB en JSON
app.use(express.urlencoded({ limit: '5mb', extended: true }));


// Routes
app.use('/api', routes); // Usar todas las rutas

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!', status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});