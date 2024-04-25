const catchAsync = require('../utils/catchAsync');
const { Images, QrCodes } = require('../models');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../utils/cloudinary');

exports.createImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  console.log(req.file.path);
  // Upload image to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'events',
  });

  // For Development only
  // const imageUrl = `${req.protocol}://${req.get('host')}/images/${
  //   req.imageDestination
  // }/${req?.imageFileName}`;

  const createdImage = await Images.create({
    id: result.public_id,
    imageUrl: result.secure_url, // Fix the attribute name here
    imagename: req.imageFileName,
  });

  req.createdImage = createdImage;
  next();
});

exports.unLinkImage = (name) => {
  const filePath = path.join(__dirname, '../public/images', name);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

exports.deleteImage = async (id) => {
  const targetImage = await Images.findByPk(id);

  if (!targetImage) return;

  await cloudinary.uploader.destroy(id);
  await Images.destroy({ where: { id: id } });
  this.unLinkImage(targetImage.imagename);
  return;
};

exports.deleteQr = async (id) => {
  const targetQr = await QrCodes.findByPk(id);

  if (!targetQr) return;

  await QrCodes.destroy({ where: { id: id } });
  this.unLinkImage(`${targetQr.invitationId}.png`);

  return;
};

//  Upload Photos

//   app.post('/create-image', upload.single('image'), async (req, res, next) => {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No image file provided' });
//     }

//     const createdImage = await Images.create({
//       image: req.file.buffer,
//       filename: req.file.filename,
//     });

//     const imageUrl = `${req.protocol}://${req.get('host')}/images/${
//       createdImage.filename
//     }`;

//     res.status(201).json({ imageUrl });
//   });

// Qr Code

// const sharp = require('sharp');

// app.get('/generate-qr', async (req, res) => {
//   try {
//     // Generate QR code data
//     const url = 'www.example.com'; // Replace with your actual data

//     // Generate QR code as a data URL
//     const qrCodeDataURL = await qr.toDataURL(url, { width: 600, height: 600 });

//     // Create a buffer from the data URL
//     const qrCodeBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');

//     // Create a sharp object from the buffer
//     const sharpImage = sharp(qrCodeBuffer);

//     // Save the image to a file (e.g., public/images/qrcode.png)
//     const imagePath = 'public/images/qrcode3.png';
//     await sharpImage.toFile(imagePath);

//     // Respond with the generated image path
//     res.status(200).json({ imagePath });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// Delete Images

// exports.deleteEvent = async (req, res, next) => {
//   try {
//     const eventId = req.params.eventId;

//     // Fetch the event from the database to get the filename
//     const event = await Events.findByPk(eventId);

//     if (!event) {
//       return res.status(404).json({ error: 'Event not found' });
//     }

//     // Delete the file from the 'public/images' directory
//     const filePath = path.join(__dirname, '../public/images', event.filename);
//     fs.unlinkSync(filePath);

//     // Delete the event record from the database
//     await Events.destroy({ where: { id: eventId } });

//     res.status(200).json({ message: 'success', data: 'Event and file deleted' });
//   } catch (error) {
//     next(error);
//   }
// };
