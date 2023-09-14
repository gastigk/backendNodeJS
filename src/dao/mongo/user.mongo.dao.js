import userModel from '../../models/user.model.js';

export default class UsersDaoBD {
  constructor() {}
  getAll = async () => await userModel.find();
  getById = async (id) => await userModel.findById(id);
  getOne = async (query) => await userModel.findOne(query).exec();
  create = async (data) => await userModel.create(data);
  update = async (id, data) =>
    await userModel.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  delete = async (id) => await userModel.findByIdAndRemove(id);
  save = async (data) => await userModel.create(data);
}