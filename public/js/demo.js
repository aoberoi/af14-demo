var session = TB.initSession(sessionId),
    controlEl = document.getElementById('control'),
    connectButton = document.getElementById('connect'),
    streamsStat = document.getElementById('streamCount'),
    connectionsStat = document.getElementById('connectionCount'),
    streamCount = 0,
    connectionCount = 0,
    publishButton,
    publisher,
    publisherInterval,
    subscriberIntervals = {};

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
    connectionCount--;
    updateConnectionCount();
  },

  streamCreated: function(event) {
    var af14El = document.createElement('div');
    af14El.id = 'sub-'+event.stream.streamId;
    af14El.classList.add('af14');
    document.getElementById('subscribers').appendChild(af14El);
    var subscriber = session.subscribe(event.stream, 'subscribers', { insertMode: 'append', width: 132, height: 99 });

    streamCount++;
    updateStreamCount();

    subscriberIntervals[event.stream.streamId] = setInterval(function() {
      var oCanvasImg = new Image();
      oCanvasImg.setAttribute("src", "data:image/png;base64," + subscriber.getImgData());
      af14El.innerHTML = "";
      af14El.appendChild(asciifyImage(oCanvasImg, 132, 99));
    }, 100);
  },

  streamDestroyed: function(event) {
    streamCount--;
    updateStreamCount();

    clearInterval(subscriberIntervals[event.stream.streamId]);
    var sAscii = document.querySelector('#sub-'+event.stream.streamId);
    sAscii.parentNode.removeChild(sAscii);
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
  publisher.on('streamDestroyed', stoppedPublishing);
  session.disconnect();
}

function startPublishing() {
  document.getElementById('publisher').innerHTML = '<div class="af14"></div>';
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

  var pAscii = document.querySelector('#publisher .af14');
  publisherInterval = setInterval(function () {
      var oCanvasImg = new Image();
      oCanvasImg.setAttribute("src", "data:image/png;base64," + publisher.getImgData());
      pAscii.innerHTML = "";
      pAscii.appendChild(asciifyImage(oCanvasImg, 264, 198));
  }, 100);
}

function stoppedPublishing(e) {
  publishButton.textContent = 'Publish';
  publishButton.removeEventListener('click', stopPublishing);
  publishButton.addEventListener('click', startPublishing);

  streamCount--;
  updateStreamCount();

  clearInterval(publisherInterval);
  var pAscii = document.querySelector('#publisher .af14');
  pAscii.parentNode.removeChild(pAscii);
}

function updateStreamCount() {
  streamsStat.textContent = 'Streams: ' + streamCount;
}

function updateConnectionCount() {
  connectionsStat.textContent = 'Connections: ' + connectionCount;
}
