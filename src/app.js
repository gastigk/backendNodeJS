import express from 'express';
import path from 'path';
const app = express();

// const __dirname = path.dirname(new URL(import.meta.url).pathname);

// server configuration to receive data
const server = app.listen(8080, () => console.log('Listening on PORT 8080'));

// folder's resources statically
app.use(express.static(path.resolve('..', 'public')));

// interpret JSON messages in urlencoded format on receipt
app.use(express.json);
app.use(express.urlencoded({ extended: true })); // allows sending information also from the URL

// third-party middleware 
import cookieParser from 'cookie-parser';
app.use(cookieParser());