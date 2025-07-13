import dotenv from "dotenv";
import express from "express";
import { sql } from "./config/db.js";
import ratelimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";

dotenv.config();

const app = express();

//middleware
app.use(ratelimiter);

app.use(express.json())

const PORT = process.env.PORT || 5001;

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions(
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`
    console.log("Database initialized successfully")
  } catch (error) {
    console.log("Error initializing DB", error)
    process.exit(1)
  }
}

app.get("/", (req, res) => {
    res.send("it`s working");
})

app.use("/api/transactions", transactionsRoute);

initDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server is running on PORT:", PORT);
    });
})