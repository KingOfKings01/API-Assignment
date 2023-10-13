import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', 
  }],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const Order = mongoose.model('Order', orderSchema);


