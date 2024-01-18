const express = require('express');
const router = express.Router();

const {generateTicket,getTicket} = require('../Controllers/Ticket.js')

router.post('/generateticket',generateTicket);
router.get('/gettickets/:pageSize/:pageNumber',getTicket);

module.exports = router;