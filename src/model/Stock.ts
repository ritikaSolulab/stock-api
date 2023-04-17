import mongoose from 'mongoose'

const stockSchema = new mongoose.Schema(
    {
        symbol: {
            type: String,
        },
        stockDetails: {type: Object, required:true}
    },
    {timestamps:true}
);

export const StockModel = mongoose.model('Stock', stockSchema);