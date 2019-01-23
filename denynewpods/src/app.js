// libraries
const bodyParser = require('body-parser'),
      express    = require('express'),
      fs         = require('fs'),
      https      = require('https'),
      morgan     = require('morgan');

// server instance and middlewares
var app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());

// health check for readiness
app.get('/health', (req, res) => {
  res.status(200).end();
});

// process POST
app.post('/', (req, res) => {
  // set the proper header
  res.setHeader('Content-Type', 'application/json');

  // send the response
  var admissionReview = {
        response: {
          allowed: false,
          status: {
            status: 'Failure',
            message: 'New pods denied.',
            reason: 'No new pods allowed in this project.',
            code: 402
          }
        }
      };
  res.send(JSON.stringify(admissionReview));

  // send the status and close the connection
  res.status(200).end();
});

// start server
https.createServer({
  key: fs.readFileSync('/opt/app-root/src/ssl/tls.key'),
  cert: fs.readFileSync('/opt/app-root/src/ssl/tls.crt')
}, app)
.listen(8443, () => {
  console.log('[Webhook] Webhook running...');
});
