import mongoose from 'mongoose';

const userCollection = 'users';

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
    },
    age: {
      type: String,
    },
    role: {
      type: String,
    },
    password: {
      type: String,
    },
    photo: {
      type: String,
    },
    document: [
      {
        type: String,
      },
    ],
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'carts',
      required: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    premium: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

mongoose.set('strictQuery', false);
const UserModel = mongoose.model(userCollection, userSchema);

export default UserModel;