import cartRouter from '../routers/cart.router.js';
import chatRouter from '../routers/chat.router.js';
import checkoutRouter from '../routers/checkout.router.js';
import documentationRouter from '../routers/documentation.router.js';
import indexRouter from '../routers/index.router.js';
import loginRouter from '../routers/login.router.js';
import loginGithubRouter from '../routers/logingithub.router.js';
import logoutRouter from '../routers/logout.router.js';
import forgotPasswordRouter from '../routers/password-forgot.router.js';
import resetPasswordRouter from '../routers/password-reset.router.js';
import productEditRouter from '../routers/product-edit.admin.router.js';
import mockingProductRouter from '../routers/product-mocking.router.js';
import productTableRouter from '../routers/product-table.router.js';
import productEditByIdRouter from '../routers/product.admin.router.js';
import productDeletedRouter from '../routers/product.admin.router.js';
import adminPanelRouter from '../routers/product.admin.router.js';
import productInRealTimeRouter from '../routers/product.realtime.router.js';
import productRouter from '../routers/product.router.js';
import signupAdminRouter from '../routers/signup.admin.router.js';
import singupRouter from '../routers/signup.router.js';
import usersPremiumRouter from '../routers/user.premium.router.js';
import usersRouter from '../routers/users.router.js';

const views = [
  { path: '/', router: indexRouter },
  { path: '/auth/register', router: singupRouter },
  { path: '/auth/register-admin', router: signupAdminRouter },
  { path: '/auth/login', router: loginRouter },
  { path: '/auth/password-forgot', router: forgotPasswordRouter },
  { path: '/auth/password-reset', router: resetPasswordRouter },   
  { path: '/github', router: loginGithubRouter },
  { path: '/logout', router: logoutRouter },
  { path: '/chat', router: chatRouter },
  { path: '/cart', router: cartRouter },
  { path: '/notifications/deleted-cart', router: cartRouter },
  { path: '/checkout', router: checkoutRouter },
  { path: '/products', router: productRouter },
  { path: '/notifications/deleted-product', router: productDeletedRouter },
  { path: '/notifications/edited-product', router: productEditByIdRouter },
  { path: '/product-edit', router: productEditRouter },
  { path: '/product', router: productRouter },
  { path: '/products-realtime', router: productInRealTimeRouter },
  { path: '/products-table', router: productTableRouter },
  { path: '/mockingproduct', router: mockingProductRouter },
  { path: '/admin-panel', router: adminPanelRouter },
  { path: '/users', router: usersRouter },
  { path: '/users/user-new', router: usersRouter },
  { path: '/users/profile', router: usersRouter },
  { path: '/users/profile/documents', router: usersPremiumRouter },
  { path: '/users/documents', router: usersRouter },
  { path: '/users/premium', router: usersRouter },
  { path: '/docs-api', router: documentationRouter },

];

export default views;