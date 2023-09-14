import jwt from 'jsonwebtoken';

import config from '../config/config.js';

export const generateToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    age: user.age,
    phone: user.phone,
    active: user.active,
    updatedAt: user.updatedAt,
  };

  const token = jwt.sign(payload, config.jwt.privateKey, {
    expiresIn: '24h',
  });

  return token;
};