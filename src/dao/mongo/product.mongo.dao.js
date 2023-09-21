import productModel from '../../models/product.model.js';

export default class ProductDaoBD {
  constructor() {}

  create = async (data) => await productModel.create(data);
  delete = async (id) => await productModel.findByIdAndRemove(id).lean();
  filter = async (filter) => await productModel.countDocuments(filter);
  getAll = async () => await productModel.find().lean();
  getAllLimit = async (limit) => await productModel.find().limit(limit).lean();
  getAllQuery = async (data) => await productModel.find().sort(data).lean();
  getById = async (id) => await productModel.findById(id);
  getByCategory = async (data) => await productModel.distinct(data);
  getByCategoryAll = async (data) => await productModel.find({}).distinct(data);
  getOne = async (Object) => await productModel.findOne(Object);
  insertMany = async (data) => await productModel.insertMany(data);
  paginate = async (filter, options) =>
    await productModel.paginate(filter, options);
  setCategory = async (Array) => await productModel.aggregate(Array);
  update = async (id, data) =>
    await productModel.findByIdAndUpdate(id, data, { returnDocument: 'after' });
}
