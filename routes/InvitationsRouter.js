const express = require('express');
const InvitaionsController = require('../controllers/InvitationsController');
const app = require('../app');

const router = express.Router();

router
  .route('/')
  .post(InvitaionsController.createInvitaion)
  .delete(InvitaionsController.deleteInvitation);

//test
router.route('/sss').get(InvitaionsController.ScanEventsAndUpdateInvitations);

router.route('/updateStatus').post(InvitaionsController.updateInvitationStatus);
router.route('/update').post(InvitaionsController.updateInvitation);
router
  .route('/invitationForVip')
  .get(InvitaionsController.getInvitaionByEventandUserIds);
router.route('/byEventId/:id').get(InvitaionsController.getInviationsByEvent);
router.route('/:id').get(InvitaionsController.getInvitation);

module.exports = router;
