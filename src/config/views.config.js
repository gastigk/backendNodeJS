import productRouter from '../routers/product.router.js';
import mockingproductsRouter from '../routers/mockingproduct.router.js';
import productsEditRouter from '../routers/product-edit.admin.router.js';
import productsdeletebyidRouter from '../routers/product.admin.router.js';
import productsTableRouter from '../routers/product-table.router.js';
import cartRouter from '../routers/cart.router.js';
import indexRouter from '../routers/index.router.js';
import chatRouter from '../routers/chat.router.js';
import productsInRealTimeRouter from '../routers/product.realtime.router.js';
import productsEditByIdRouter from '../routers/product.admin.router.js';
import loginRouter from '../routers/login.router.js';
import loginGithubRouter from '../routers/logingithub.router.js';
import singupRouter from '../routers/signup.router.js';
import logoutRouter from '../routers/logout.router.js';
import checkoutRouter from '../routers/checkout.router.js';
import usersRouter from '../routers/user.router.js';
import signupAdminRouter from '../routers/signup.admin.router.js';
import adminPanel from '../routers/product.admin.router.js';

const views = [
  { path: '/', router: indexRouter },
  { path: '/products', router: productRouter },
  { path: '/mockingproducts', router: mockingproductsRouter },
  { path: '/productstable', router: productsTableRouter },
  { path: '/productsdeletebyid', router: productsdeletebyidRouter },
  { path: '/productsedit', router: productsEditRouter },
  { path: '/productseditbyid', router: productsEditByIdRouter },
  { path: '/productsid', router: productRouter },
  { path: '/carts', router: cartRouter },
  { path: '/chat', router: chatRouter },
  { path: '/login', router: loginRouter },
  { path: '/signup', router: singupRouter },
  { path: '/logout', router: logoutRouter },
  { path: '/realTimeProducts', router: productsInRealTimeRouter },
  { path: '/cartsDeleteById', router: cartRouter },
  { path: '/checkout', router: checkoutRouter },
  { path: '/users', router: usersRouter },
  { path: '/users/newUser', router: usersRouter },
  { path: '/users/profile', router: usersRouter },
  { path: '/signupadmin', router: signupAdminRouter },
  { path: '/github', router: loginGithubRouter },
  { path: '/admin-panel', router: adminPanel },
];

export default views;