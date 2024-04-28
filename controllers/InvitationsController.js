const {
  Invitations,
  Events,
  Vips,
  QrCodes,
  Products,
  Bills,
  Tables,
} = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(
  'sk_test_51P2CZO058qqSIt9U4RSCEC66KMYzMUVtnkOzycZl39t93FMmB6Jb5XjtqH8DOqd1wVS72PRL5uADQsKL7vKCPfNB00vsZvcyGD'
);
const sharp = require('sharp');
const qr = require('qrcode');
const WhereClauseFilter = require('../utils/WhereClauseFilter');
const { Pagination } = require('../utils/Pagination');
const { Op, sequelize } = require('sequelize');
const cloudinary = require('../utils/cloudinary');
const { Sequelize, Transaction } = require('sequelize');

// Local CreateQrCode
// exports.createQrCode = async (req, newInvitation) => {
//   try {
//     // Generating the Qr Code

//     // Url for database to use it
//     const url = `${req.protocol}://${req.get('host')}/images/${
//       newInvitation.id
//     }.png`;

//     // Create New Qr for This Invitation
//     const newQrCode = await QrCodes.create({
//       qrUrl: url,
//       invitationId: newInvitation.id,
//     });

//     // set the Qr Url that send me to qrInvitationPage
//     const urlScan = `${newInvitation.id}`;

//     // Generate QR code as a data URL
//     const qrCodeDataURL = await qr.toDataURL(urlScan, {
//       width: 500,
//       height: 500,
//     });

//     // Create a buffer from the data URL
//     const qrCodeBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');

//     // Create a sharp object from the buffer
//     const sharpImage = sharp(qrCodeBuffer);

//     // Save the image to a file (e.g., public/images/qrcode.png)
//     const imagePath = `public/images/${newInvitation.id}.png`;

//     await sharpImage.toFile(imagePath);

//     return { newQrCode, url };
//   } catch (error) {
//     throw new AppError('Cannot Create Qr Code', 400);
//   }
// };

// Deployment Create Qr Code
exports.createQrCode = async (req, newInvitation) => {
  try {
    // set the Qr Url that sends me to qrInvitationPage
    const urlScan = `${newInvitation.id}`;

    // Generate QR code as a data URL
    const qrCodeDataURL = await qr.toDataURL(urlScan, {
      width: 250,
      height: 250,
    });

    // Upload buffer to Cloudinary
    const result = await cloudinary.uploader.upload(qrCodeDataURL, {
      folder: 'qrCodes',
    });

    const url = result.secure_url;

    // Create New Qr for This Invitation
    const newQrCode = await QrCodes.create({
      id: result.public_id,
      qrUrl: url,
      invitationId: newInvitation.id,
    });

    return { newQrCode, url };
  } catch (error) {
    throw error;
  }
};

// Function to remove unpaid invitations after 10 minutes
const removeUnpaidInvitations = async (invitationId) => {
  try {
    // Wait for 10 minutes
    await new Promise((resolve) => setTimeout(resolve, 60 * 10 * 1000));

    // Find the invitation by ID
    const invitation = await Invitations.findByPk(invitationId);

    // If invitation is still unpaid, remove it
    if (invitation && !invitation.paid) {
      await Invitations.destroy({
        where: {
          id: invitation.id,
        },
      });
      console.log(`Removed unpaid invitation with ID ${invitationId}.`);
    }
  } catch (error) {
    console.error('Error removing unpaid invitation:', error);
  }
};

exports.createStripeSession = async (
  checkEvent,
  newInvitation,
  additionalData
) => {
  try {
    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],

      line_items: newInvitation.products.map((item) => {
        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${item.name}`,
            },
            unit_amount: Number(item.price) * 100,
          },
          quantity: item.quantity,
        };
      }),
      mode: 'payment',
      success_url: `https://qr-test-iw1o.vercel.app/eventaccess/${checkEvent.id}`,
      cancel_url: `https://qr-test-iw1o.vercel.app/eventaccess/${checkEvent.id}`,
      metadata: additionalData, // Incl
    });

    // Schedule removal of unpaid invitation after 10 minutes
    const invitationId = newInvitation.id;
    removeUnpaidInvitations(invitationId);

    return { session };
  } catch (error) {
    throw error;
  }
};

// Create Approved Invitaion
exports.createInvitaion = catchAsync(async (req, res, next) => {
  const checkEvent = await Events.findByPk(req.body.eventId);
  const checkVip = await Vips.findByPk(req.body.vipId);

  // Check Validate Informations
  if (!req.body.eventId || !checkEvent) {
    return next(new AppError('Event Not exist', 404));
  }
  if (!req.body.vipId || !checkVip) {
    return next(new AppError('Unable to recognize the customer', 404));
  }

  if (req.body.tableReservation == true) {
    const duplicatedTable = await Invitations.findOne({
      where: {
        tableId: req.body.tableId,
        eventId: req.body.eventId,
      },
    });
    if (duplicatedTable) {
      return next(new AppError('Sorry No Tables Available', 400));
    }
  }

  const checkDuplicatedInvitaion = await Invitations.findOne({
    where: {
      eventId: req.body.eventId,
      vipId: req.body.vipId,
    },
  });

  if (checkDuplicatedInvitaion) {
    return next(
      new AppError('User Already Have Invitaion for this Event', 400)
    );
  }

  const withProducts =
    req?.body?.products && req?.body?.products?.length > 0 ? true : false;

  const newInvitation = await Invitations.create({
    ...req.body,
    paid: withProducts ? false : true,
    status: withProducts ? 'pending' : 'approved',
  });

  /// if have Product Create Session for him
  if (withProducts) {
    const additionalData = {
      inviteId: newInvitation.id,
    };

    const { session } = await this.createStripeSession(
      checkEvent,
      newInvitation,
      additionalData
    );

    // Add the Payment Link to Pending One
    await Invitations.update(
      { ...newInvitation, paymentUrl: session.url },
      {
        where: {
          id: newInvitation.id,
        },
      }
    );

    res.json({ data: session });
    return;
  }

  // Create QrCode
  const { newQrCode, url } = await this.createQrCode(req, newInvitation);

  const updatedInvitation = await Invitations.update(
    { status: 'approved', qrCodeId: newQrCode.id, qrCodeUrl: url },
    {
      where: { id: newInvitation.id },
      returning: true, // This ensures that the updated record is returned
    }
  );

  res.status(200).json({ message: 'success', data: updatedInvitation });
});

const endpointSecret = 'whsec_UUE7SLbIIbf8wsCOgBKNZTR6ffC44B9O';

exports.stripeWebHook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      try {
        const sessionComplete = event.data.object;

        const newInvitation = await Invitations.findOne({
          where: {
            id: sessionComplete.metadata.inviteId,
          },
        });
        // const checkEvent = await Events.findByPk(newInvitation.eventId);

        // Generating the Qr Code
        const { newQrCode, url } = await this.createQrCode(req, newInvitation);

        const payment = await Bills.create({
          invitationId: newInvitation.id,
          eventId: newInvitation.eventId,
          vipId: newInvitation.vipId,
          date: new Date(),
          amount: sessionComplete.amount_total / 100,
        });
        await Invitations.update(
          {
            status: 'approved',
            qrCodeId: newQrCode.id,
            qrCodeUrl: url,
            paid: true,
            paymentId: payment.id,
          },
          {
            where: { id: newInvitation.id },
            returning: true, // This ensures that the updated record is returned
          }
        );
      } catch (error) {
        res.status(400).send(`Webhook Error: ${error}`);
      }
      // Then define and call a function to handle the event payment_intent.succeeded
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
};

// INvitaions By Event
exports.getInviationsByEvent = catchAsync(async (req, res, next) => {
  const { status, name, deliveryOption } = req.query;
  const PaginationInstance = new Pagination(
    parseInt(req.query.pageIndex) || 1,
    parseInt(req.query.pageSize) || 10
  );

  const filter = [
    { key: 'status', value: status, whereValue: status },
    {
      key: 'deliveryOption',
      value: deliveryOption,
      whereValue: { [Op.eq]: deliveryOption },
    },
    { key: '$vip.name$', value: name, whereValue: { [Op.like]: `%${name}%` } },
  ];

  const count = await Invitations.count({
    where: {
      eventId: req.params.id,
    },
  });
  const Allinvitations = await Invitations.findAll({
    offset: PaginationInstance.offset(),
    limit: PaginationInstance.pageSize,
    where: {
      eventId: req.params.id,
      ...WhereClauseFilter(filter),
    },
    include: {
      model: Vips,
      as: 'vip',
      attributes: ['name', 'email', 'phone', 'id'], // Specify attributes you want to include
    },
  });

  const pagination = {
    ...PaginationInstance,
    totalPages: PaginationInstance.totalPages(count),
    totalCount: count,
  };

  res.status(200).json({
    message: 'success',
    data: Allinvitations,
    pagination,
  });
});

// Get Invitaion

exports.getInvitation = catchAsync(async (req, res, next) => {
  const invitation = await Invitations.findByPk(req.params.id, {
    include: {
      model: Tables,
      as: 'table',
    },
  });

  if (!invitation) {
    return next(new AppError('Invitation Not Exist', 404));
  }
  const event = await Events.findByPk(invitation.eventId);
  const vip = await Vips.findByPk(invitation.vipId);

  if (!event || !vip) {
    return next(new AppError('Event or Vip Not Exist', 404));
  }

  res.status(200).json({
    message: 'success',
    data: {
      invitation,
      event,
      vip,
    },
  });
});

// Get Invitaion for vips
exports.getInvitaionByEventandUserIds = catchAsync(async (req, res, next) => {
  const invitation = await Invitations.findOne({
    where: { eventId: req.query.eventId, vipId: req.query.vipId },
  });

  if (!invitation) {
    return next(new AppError('No Invitaion for this event or vip', 404));
  }

  res.status(200).json({ message: 'success', data: invitation });
});

// update Invitaion Status
exports.updateInvitationStatus = catchAsync(async (req, res, next) => {
  const invitationId = req.body.id; // Assuming the invitation ID is passed in the request params
  const newStatus = req.body.status; // Assuming the new status is passed in the request body

  // Update the invitation status
  const updatedInvitation = await Invitations.update(
    { status: newStatus, completedDate: new Date() },
    {
      where: { id: invitationId },
      returning: true, // This ensures that the updated record is returned
    }
  );

  if (updatedInvitation[0] === 0) {
    // If no records were updated, the invitation with the given ID does not exist
    return res.status(404).json({ message: 'Invitation not found' });
  }

  // The updatedInvitation variable contains an array with two elements:
  // - The number of updated rows (updatedInvitation[0])
  // - An array of the updated records (updatedInvitation[1])

  const updatedInvitationRecord = updatedInvitation[1][0];

  res.status(200).json({ message: 'Success', data: updatedInvitationRecord });
});

// Force Delete Invitation To Avoid Stats affect
exports.deleteInvitation = catchAsync(async (req, res, next) => {
  const { id } = req.query;

  const targetInvitaion = await Invitations.findOne({ where: { id: id } });
  if (targetInvitaion.qrCodeId) {
    await cloudinary.uploader.destroy(targetInvitaion.qrCodeId);
  }

  await Invitations.destroy({
    where: {
      id: id,
    },
    force: true,
  });

  res.status(204).json({ message: 'done' });
});

exports.updateInvitation = catchAsync(async (req, res, next) => {
  if (req.body.tableReservation == true) {
    const duplicatedTable = await Invitations.findOne({
      where: {
        tableId: req.body.tableId,
        eventId: req.body.eventId,
      },
    });
    if (duplicatedTable && req.body.id !== duplicatedTable?.id) {
      return next(
        new AppError(
          `Sorry No Tables Available ${duplicatedTable?.id}, ${req.body.id} `,
          400
        )
      );
    }
  }

  updatedInvite = await Invitations.update(req.body, {
    where: {
      id: req.body.id,
    },
  });

  // Check if any rows were affected (updated)
  if (updatedInvite[0] === 0) {
    return res
      .status(404)
      .json({ message: 'Invitation not found or not updated.' });
  }

  res.status(200).json({ message: 'success', data: updatedInvite });
});

// Update Invitation to Missed IF the Event start time is less than current time and 5 hours ago
exports.ScanEventsAndUpdateInvitations = catchAsync(async (req, res, next) => {
  const currentDate = new Date();
  const fiveHoursAgo = new Date(currentDate.getTime() - 5 * 60 * 60 * 1000); // Subtract 5 hours in milliseconds

  const pastEvents = await Events.findAll({
    where: {
      date: {
        [Op.lt]: fiveHoursAgo, // Use 'lt' (less than) operator
      },
    },
  });

  const updatePromises = pastEvents.map(async (event) => {
    try {
      await Invitations.update(
        { status: 'missed' }, // Set status to 'missed'
        { where: { eventId: event.id, status: { [Op.ne]: 'completed' } } }
      );
    } catch (error) {
      console.error(`Error updating invitations for event ${event.id}:`, error);
      // Handle individual update errors (optional, e.g., logging or retrying)
    }
  });

  await Promise.all(updatePromises);
});
