import mongoose, { Types } from "mongoose";

const historySchema = new mongoose.Schema(
  {
    symbol: { type: String, ref: "Stock" },
    stockDetails: {type: Object, required:true},
  },
  { timestamps: true }
);

export const HistoryModel = mongoose.model("History", historySchema);
