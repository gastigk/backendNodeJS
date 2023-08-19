import cartModel from '../../models/cart.model.js';

export default class CartDaoBD {
  constructor() {}
  getOne = async (Object) => await cartModel.findOne(Object).exec();
  getAll = async () => await cartModel.find();
  getById = async (id) => await cartModel.findById(id).lean().exec();
  setCart = async (Array) => await cartModel.aggregate(Array);
  create = async (data) => await cartModel.create(data);
  update = async (id, data) =>
    await cartModel.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  delete = async (Object) => await cartModel.deleteOne(Object);
}
