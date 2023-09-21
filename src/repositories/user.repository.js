export default class UserRepository {
  constructor(dao) {
    this.dao = dao;
  }

  create = async (data) => await this.dao.create(data);
  delete = async (id) => await this.dao.delete(id);
  getAll = async () => await this.dao.getAll();
  getById = async (id) => await this.dao.getById(id);
  getOne = async (query) => await this.dao.getOne(query);
  save = async (data) => await this.dao.save(data);
  update = async (id, data) => await this.dao.update(id, data);
}
