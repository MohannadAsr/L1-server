const express = require('express'); // Express
const multer = require('multer'); // For handling file uploads
const stripe = require('stripe')(process.env.STRIPE_SK);

const InvitaionsController = require('./controllers/InvitationsController');
const cron = require('node-cron');

// Scheduling A task for Events Invitations Sets to missed
const schedule = cron.schedule(
  '0 0,12 * * *',
  InvitaionsController.ScanEventsAndUpdateInvitations
); // Every day at midnight

// importing the routers for each route

const cors = require('cors');
const vipsRouter = require('./routes/VipsRouter');
const billsRouter = require('./routes/BillsRouter');
const evenstRouter = require('./routes/EventsRouter');
const productsRouter = require('./routes/productsRouter');
const usersRouter = require('./routes/usersRouter');
const StatsRouter = require('./routes/StatsRouter');
const invitationsRouter = require('./routes/InvitationsRouter');
const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');
// Define the Server
const app = express();

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  InvitaionsController.stripeWebHook
);

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
app.use('/api/bills', billsRouter);
app.use('/api/products', productsRouter);
app.use('/api/events', evenstRouter);
app.use('/api/invitaions', invitationsRouter);
app.use('/api/stats', StatsRouter);
app.use('/users', usersRouter);

// All Unhandled Routes [Must be the last Route or it will be handled no matter what is the req url]
app.all('*', (req, res, next) => {
  next(new AppError(`Could Not Found ${req.originalUrl} on this server`, 404));
});

// Error Handling MiddleWare
app.use(globalErrorController);

module.exports = app;
