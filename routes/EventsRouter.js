const express = require('express');
const router = express.Router();
const multer = require('multer'); // For handling file uploads
const EventsController = require('../controllers/eventsController');
const ImagesController = require('../controllers/ImagesController');
const uuid = require('uuid');

const imageDestination = 'events';

// storage = multer.diskStorage({
//   destination: `public/images/${imageDestination}`,
//   filename: (req, file, cb) => {
//     // Assuming you have access to the generated ID (e.g., createdImage.id)
//     const uniqueFileName = `${uuid.v4()}.${file.originalname.split('.')[1]}`;
//     req.imageFileName = uniqueFileName;
//     req.imageDestination = imageDestination;
//     cb(null, uniqueFileName);
//   },
// });

// upload = multer({ storage: storage });

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
  .route('/')
  .get(EventsController.getEvents)
  .post(
    upload.single('image'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get the file data
        const fileData = req.file.buffer;

        // Get FS Bucket URL from environment variables
        const fsBucketUrl = process.env.CC_FS_BUCKET;

        if (!fsBucketUrl) {
          throw new Error('FS Bucket URL is not provided');
        }

        // Upload file to FS Bucket
        const response = await axios.put(fsBucketUrl, fileData, {
          headers: {
            'Content-Type': req.file.mimetype,
          },
        });

        console.log('File uploaded successfully:', response.data);

        // Respond with success message
        res.json({ message: 'File uploaded successfully' });
      } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
      }
    },
    EventsController.createEvent
  )
  .delete(EventsController.deleteEvent);
router.route('/homeInfo').get(EventsController.getHomeInfos);

router.route('/:id').get(EventsController.getEventByID);
module.exports = router;
