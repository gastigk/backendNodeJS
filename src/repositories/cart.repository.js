export default class CartRepository {
    constructor(dao) {
        this.dao = dao
    }
    create = async(data) => await this.dao.create(data)
}