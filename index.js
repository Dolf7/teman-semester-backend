import express from 'express';
import bodyParser from 'body-parser';

import usersRoutes from './route/users.js';
import loginRoutes from './route/login.js';
import tokenRoutes from './route/token.js';

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(bodyParser.json());

app.use('/users', usersRoutes);
app.use('/login', loginRoutes);
app.use('/token', tokenRoutes);

app.get('/', (req, res) =>{
    res.send("Hello, This is Homepage");
})

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));
