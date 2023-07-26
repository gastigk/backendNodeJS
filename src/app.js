import express from 'express';

const app = express();

// sever configuration to receive data
const sever = app.listen(8080,() => console.log("Listening on PORT 8080"))

// interpret JSON messages in urlencoded format on receipt
app.use(express.json) 
app.use(express.urlencoded({extended:true})); // allows sending information also from the URL