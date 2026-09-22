import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';
dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "Order API is running",
  });
});

app.use(errorMiddleware);
app.use(notFoundMiddleware);

export default app;

