var session = TB.initSession(sessionId);
//var publisher = TB.initPublisher(apiKey, 'publisher');
var controlEl = document.getElementById('control');
var connectButton = document.getElementById('connect');
var publishButton;
var publisher;

connectButton.addEventListener('click', connectToSession);

session.on({

  sessionConnected: function(event) {
    publishButton = document.createElement('button');
    publishButton.id = 'publish';
    publishButton.textContent = 'Publish';
    publishButton.addEventListener('click', startPublishing);
    controlEl.insertBefore(publishButton, connectButton);
    connectButton.textContent = 'Disconnect';
    connectButton.removeEventListener('click', connectToSession);
    connectButton.addEventListener('click', disconnectFromSession);
  },

  sessionDisconnected: function(event) {
    controlEl.removeChild(publishButton);
    connectButton.textContent = 'Connect';
    connectButton.removeEventListener('click', disconnectFromSession);
    connectButton.addEventListener('click', connectToSession);
  },

  streamCreated: function(event) {
    session.subscribe(event.stream, 'subscribers', { insertMode: 'append' });
  }

});

function connectToSession() {
  session.connect(apiKey, token);
}

function disconnectFromSession() {
  session.disconnect();
}

function startPublishing() {
  publisher = session.publish('publisher', { insertMode: 'append' }, startedPublishing);
}

function stopPublishing() {
  publisher.on('streamDestroyed', stoppedPublishing);
  session.unpublish(publisher);
}

function startedPublishing(err) {
  if (err) { console.log(err); return; }
  publishButton.textContent = 'Unpublish';
  publishButton.removeEventListener('click', startPublishing);
  publishButton.addEventListener('click', stopPublishing);
}

function stoppedPublishing(e) {
  publishButton.textContent = 'Publish';
  publishButton.removeEventListener('click', stopPublishing);
  publishButton.addEventListener('click', startPublishing);
}
