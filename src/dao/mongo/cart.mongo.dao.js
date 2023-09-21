import cartModel from '../../models/cart.model.js';

export default class CartDaoBD {
  constructor() {}

  create = async (data) => await cartModel.create(data);
  delete = async (Object) => await cartModel.deleteOne(Object);
  getAll = async () => await cartModel.find();
  getById = async (id) => await cartModel.findById(id);
  getOne = async (Object) => await cartModel.findOne(Object).exec();
  getOnePopulate = async (Object) =>
    await cartModel.findOne(Object).populate('items.producto').exec();
  save = async () => await cartModel.save();
  setCart = async (Array) => await cartModel.aggregate(Array);
  update = async (id, data) =>
    await cartModel.findByIdAndUpdate(id, data, { returnDocument: 'after' });
}
