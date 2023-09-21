export default class ProductRepository {
  constructor(dao) {
    this.dao = dao;
  }

  create = async (data) => await this.dao.create(data);
  delete = async (id) => await this.dao.delete(id);
  filter = async (filter) => await this.dao.filter(filter);
  getAll = async () => await this.dao.getAll();
  getAllLimit = async (limit) => await this.dao.getAllLimit(limit);
  getAllQuery = async (data) => await this.dao.getAllQuery(data);
  getByCategory = async (data) => await this.dao.getByCategory(data);
  getByCategoryAll = async (data) => await this.dao.getByCategoryAll(data);
  getById = async (id) => await this.dao.getById(id);
  getOne = async (Object) => await this.dao.getOne(Object);
  insertMany = async (data) => await this.dao.insertMany(data);
  paginate = async (filter, options) =>
    await this.dao.paginate(filter, options);
  setCategory = async (Array) => await this.dao.setCategory(Array);
  update = async (id, data) => await this.dao.update(id, data);
}
