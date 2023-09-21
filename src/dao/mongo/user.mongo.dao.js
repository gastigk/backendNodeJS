import userModel from '../../models/user.model.js';

export default class UsersDaoBD {
  constructor() {}

  create = async (data) => await userModel.create(data);
  delete = async (id) => await userModel.findByIdAndRemove(id);
  getAll = async () => await userModel.find();
  getById = async (id) => await userModel.findById(id);
  getOne = async (query) => await userModel.findOne(query).exec();
  save = async (data) => await userModel.create(data);
  update = async (id, data) =>
    await userModel.findByIdAndUpdate(id, data, { returnDocument: 'after' });
}
