const express = require('express');
const InvitaionsController = require('../controllers/InvitationsController');

const router = express.Router();

router.route('/').post(InvitaionsController.createInvitaion);
router.route('/updateStatus').post(InvitaionsController.updateInvitationStatus);
// router.route('/aprroveInvitation').post(InvitaionsController.approveInvitaion);
// router.route('/rejectInvitation').post(InvitaionsController.rejectInvitaion);
router
  .route('/invitationForVip')
  .get(InvitaionsController.getInvitaionByEventandUserIds);
router.route('/byEventId/:id').get(InvitaionsController.getInviationsByEvent);
router.route('/:id').get(InvitaionsController.getInvitation);

module.exports = router;
