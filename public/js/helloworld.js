var session = TB.initSession(sessionId),
    controlEl = document.getElementById('control'),
    connectButton = document.getElementById('connect'),
    streamsStat = document.getElementById('streamCount'),
    connectionsStat = document.getElementById('connectionCount'),
    streamCount = 0,
    connectionCount = 0,
    publishButton,
    publisher;

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
    session.subscribe(event.stream, 'subscribers', { insertMode: 'append', width: 132, height: 99 });
    streamCount++;
    updateStreamCount();
  },

  streamDestroyed: function(event) {
    streamCount--;
    updateStreamCount();
  },

  connectionCreated: function(event) {
    connectionCount++;
    updateConnectionCount();
  },

  connectionDestroyed: function(event) {
    connectionCount--;
    updateConnectionCount();
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
  streamCount++;
  updateStreamCount();
}

function stoppedPublishing(e) {
  publishButton.textContent = 'Publish';
  publishButton.removeEventListener('click', stopPublishing);
  publishButton.addEventListener('click', startPublishing);
  streamCount--;
  updateStreamCount();
}

function updateStreamCount() {
  streamsStat.textContent = 'Streams: ' + streamCount;
}

function updateConnectionCount() {
  connectionsStat.textContent = 'Connections: ' + connectionCount;
}
