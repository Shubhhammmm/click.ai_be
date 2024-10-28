const express = require('express');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const fileRoutes = require('./src/routes/fileRoutes');
const folderRoutes = require('./src/routes/folderRoutes');
const { setupSockets } = require('./src/services/socketService');
require('dotenv').config();
require('./config/passport');

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.use(cors({
  origin: 'https://click-ai-fe.vercel.app',
  credentials: true,
}));

setupSockets(server);
 
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000 
  }

}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/files', fileRoutes);
app.use('/folders', folderRoutes);


require("./dbconnection/index");

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
