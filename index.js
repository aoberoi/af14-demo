var opentok = require('opentok'),
    express = require('express'),
    Moniker = require('moniker'),
    apiKey = process.env.API_KEY,
    apiSecret = process.env.API_SECRET,
    ot = opentok(apiKey, apiSecret),
    app = express();

app.use(express.static(__dirname+'/public'));

var rooms = {};

app.get('/', function(req, res) {
  var roomName;
  do {
    roomName = Moniker.choose()
  } while(roomName in rooms)
  res.redirect('/'+roomName);
});

app.get('/:roomName', function(req, res) {
  var roomReady = function(err, sessionId) {
    if (err) throw err;
    var token = ot.generateToken(sessionId);
    res.render('chat.ejs', { apiKey: apiKey, sessionId: sessionId, token: token });
  }

  if (rooms[req.params.roomName]) {
    setImmediate(function() {
      roomReady(null, rooms[req.params.roomName].sessionId);
    });
  } else {
    ot.createSession(function(err, session) {
      if (err) return roomReady(err);
      rooms[req.params.roomName] = { sessionId : session.sessionId };
      roomReady(null, session.sessionId);
    });
  }
});

var port = Number(process.env.PORT || 3000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
