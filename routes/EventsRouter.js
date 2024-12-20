const express = require('express');
const router = express.Router();
const multer = require('multer'); // For handling file uploads
const EventsController = require('../controllers/eventsController');
const ImagesController = require('../controllers/ImagesController');
const uuid = require('uuid');

const imageDestination = 'events';

// Use it for Local And Development only

storage = multer.diskStorage({
  destination: `public/images/${imageDestination}`,
  filename: (req, file, cb) => {
    // Assuming you have access to the generated ID (e.g., createdImage.id)
    const uniqueFileName = `${uuid.v4()}.${file.originalname.split('.')[1]}`;
    req.imageFileName = uniqueFileName;
    req.imageDestination = imageDestination;
    cb(null, uniqueFileName);
  },
});

upload = multer({ storage: storage });

// for cloudinary
// const upload = multer({ dest: 'uploads/' });

router
  .route('/')
  .get(EventsController.getEvents)
  .post(
    upload.single('image'),
    ImagesController.createImage,
    EventsController.createEvent
  )
  .delete(EventsController.deleteEvent);
router.route('/homeInfo').get(EventsController.getHomeInfos);

router.route('/:id').get(EventsController.getEventByID);
module.exports = router;
