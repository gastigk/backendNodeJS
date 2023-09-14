import productModel from '../../models/product.model.js';

export default class ProductDaoBD {
  constructor() {}
  getAll = async () => await productModel.find().lean();
  getAllLimit = async (limit) => await productModel.find().limit(limit).lean();
  getById = async (id) => await productModel.findById(id);
  getOne = async (Object) => await productModel.findOne(Object);
  getAllQuery = async (data) => await productModel.find().sort(data).lean();
  getByCategory = async (data) => await productModel.distinct(data);
  filter = async (filter) => await productModel.countDocuments(filter);
  paginate = async (filter, options) =>
    await productModel.paginate(filter, options);
  getByCategoryAll = async (data) => await productModel.find({}).distinct(data);
  setCategory = async (Array) => await productModel.aggregate(Array);
  create = async (data) => await productModel.create(data);
  update = async (id, data) =>
    await productModel.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  delete = async (id) => await productModel.findByIdAndRemove(id).lean();
  insertMany = async (data) => await productModel.insertMany(data);
}