export default class UserDTO {
  constructor(user) {

    this._id = user._id || user.userId;
    this.email = user.email || user.user.email;
    this.role = user.role || user.user.role;
    this.first_name = user.first_name || user.user.first_name;
    this.last_name = user.last_name;
    this.full_name = `${user.first_name || user.user.first_name} ${
      this.last_name
    }`;
    this.age = user.age;
    this.phone = user.phone;
    this.premium = user.premium;
    this.photo = user.photo;
    this.updatedAt = user.updatedAt;
    this.active = user.active;
  }
}
