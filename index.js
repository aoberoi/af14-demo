var opentok = require('opentok'),
    express = require('express'),
    apiKey = process.env.API_KEY,
    apiSecret = process.env.API_SECRET,
    ot = opentok(apiKey, apiSecret),
    app = express();

app.use(express.static(__dirname+'/public'));

app.get('/', function(req, res) {
  res.send('hello world');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
