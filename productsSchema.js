import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  imageUrl: String,
  attributes: [
    {
      name: String,
      value: String,
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.model('Product', productSchema);


