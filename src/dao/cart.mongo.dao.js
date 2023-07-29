import cartModel from '../models/cart.model.js'

export default class CartMongoDAO {
    create = async(data) => await cartModel.create(data)
}