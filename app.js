const express = require('express'); // Express
const multer = require('multer'); // For handling file uploads

// importing the routers for each route

const cors = require('cors');
const vipsRouter = require('./routes/VipsRouter');
const evenstRouter = require('./routes/EventsRouter');
const usersRouter = require('./routes/usersRouter');
const invitationsRouter = require('./routes/InvitationsRouter');
const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');
// Define the Server
const app = express();

storage = multer.diskStorage({
  destination: 'public/images',
  filename: (req, file, cb) => {
    // Assuming you have access to the generated ID (e.g., createdImage.id)
    const uniqueFileName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFileName);
  },
});
exports.upload = multer({ storage: storage });

app.use('/images', express.static('public/images'));

app.use(cors());
// MiddleWares
app.use(express.json()); //  Avoid undefined Post req.body [bodyParser]

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Normal Get Request
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to my Server', app: 'my firstapp' });
});

app.use('/api/vips', vipsRouter);
app.use('/api/events', evenstRouter);
app.use('/api/invitaions', invitationsRouter);
app.use('/users', usersRouter);

// All Unhandled Routes [Must be the last Route or it will be handled no matter what is the req url]
app.all('*', (req, res, next) => {
  next(new AppError(`Could Not Found ${req.originalUrl} on this server`, 404));
});

// Error Handling MiddleWare
app.use(globalErrorController);

module.exports = app;
