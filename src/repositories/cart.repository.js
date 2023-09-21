export default class CartRepository {
  constructor(dao) {
    this.dao = dao;
  }

  create = async (data) => await this.dao.create(data);
  delete = async (id) => await this.dao.delete(id);
  getAll = async () => await this.dao.getAll();
  getById = async (id) => await this.dao.getById(id);
  getOne = async (Object) => await this.dao.getOne(Object);
  getOnePopulate = async (Object) => await this.dao.getOnePopulate(Object);
  save = async () => await this.dao.save();
  setCart = async (Array) => await this.dao.setCart(Array);
  update = async (id, data) => await this.dao.update(id, data);
}
