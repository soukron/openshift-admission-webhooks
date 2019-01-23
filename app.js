// libraries
const express  = require('express'),
      morgan   = require('morgan');

// variables
const env = process.env,
      ip  = env.WEBHOK_IP || '127.0.0.1',
      port = env.WEBHOOK_PORT || 8080;

// server instance and middleware
var app = express();
app.use(morgan('combined'));

// health check for readiness
app.get('/health', function (req, res) {
  res.status(200).end();
});

// simple echo
//app.get('/echo', function (req, res) {
//
//});

// start server
app.listen(port, ip, function () {
  console.log('[Webhook] Webhook running on http://%s:%s', ip, port);
});
