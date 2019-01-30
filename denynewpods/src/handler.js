// libraries
const express = require('express');

// router instance
var router = express.Router();

// process POST
router.post('/', (req, res) => {
  // set the proper header
  res.setHeader('Content-Type', 'application/json');

  // send the denying response
  res.send(JSON.stringify({
    response: {
      allowed: false,
      status: {
        status: 'Failure',
        message: 'New pods denied',
        reason: 'No new pods allowed in this project',
        code: 402
      }
    }
  }));

  // send the status and close the connection
  res.status(402).end();
});

// module export
module.exports = router;
