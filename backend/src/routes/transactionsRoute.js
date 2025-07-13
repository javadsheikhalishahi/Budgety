import express from "express";
import { createTransaction, deleteTransaction, getSummaryByUserId, getTransactionsByUserId } from "../controllers/transactionsController.js";

const router = express.Router();

// GET transactions
router.get("/api/transactions/:userId", getTransactionsByUserId);
  
// POST transactions
  router.post("/", createTransaction);
  
// Delete transactions
  router.delete("/:id", deleteTransaction);
  
// GET summary
  router.get("/summary/:userId", getSummaryByUserId);

export default router;