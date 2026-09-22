import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
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

const port = process.env.PORT || 8080;

