import mongoose from 'mongoose';
import shortid from 'shortid';

const cartCollection = 'carts'

const cartSchema = new mongoose.Schema(
  {
    items: [
      {
        producto: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'products',
          required: true,
        },
        cantidad: {
          type: Number,
          required: true,
        },
      },
    ],
    user: {
      email: {
        type: String,
        required: false,
      },
    },
    purchase_datetime: {
      type: Date,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.pre('findOne', function (next) {
  this.populate('items.producto');
  next();
});

cartSchema.pre('save', function (next) {
  if (!this.code) {
    this.code = shortid.generate();
  }
  next();
});

const cartModel = mongoose.model(cartCollection, cartSchema);

export default cartModel;
