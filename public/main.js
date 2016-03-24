$(function() 
{

  // -------------------------------------------------------------------------------------------
  // Constants
  // -------------------------------------------------------------------------------------------


  var kLOGIN        = "login";
  var kNEW_MESSAGE  = "new message";
  var kNEW_TIME     = "new time";
  var kNEW_PLAYER   = "new player";
  var kUSER_JOINED  = "user joined";
  var kUSER_LEFT    = "user left";
  var kUSER_ADD     = "add user";
  var kSTARTED      = "started";
  var kSTOPPED      = "stopped";

  var kTIMEOUT      = 2;


  // -------------------------------------------------------------------------------------------
  // Initialize variables
  // -------------------------------------------------------------------------------------------


  var $window     = $(window);
  var $loginPage  = $('.login.page');
  var $chatPage   = $('.chat.page');

  var username;
  var playerInfo;

  var started = false;

  var socket = io();


  // -------------------------------------------------------------------------------------------
  // Functions
  // -------------------------------------------------------------------------------------------


  function setUsername ( user ) {
    username = user.name.trim();

    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();

      socket.emit(kUSER_ADD, user);
    }
  }

  function toggleColor ( div ) {
    if ( div == "#players" || div == "#btnStart" || div == "#btnStop" ) return;

    $( "#players" ).children().css('opacity', '1');

    if ( $(div).css('opacity') == "0.5" ) {
      $(div).css('opacity', '1');
      $("#btnStart").prop('disabled', true);
    } else {
      $(div).css('opacity', "0.5");
      $("#btnStart").prop('disabled', false);
    }

    selectedPlayer = div;
  }
  
  function updateCountdown(event) {
    var format = '%H:%M:%S';
    $('#clock').html(event.strftime(format));
  }
  
  function deltaTime() {
    var dt = new Date();

    var month = dt.getMonth() + 1
    if (month < 10) month = "0" + month;
    var date = dt.getFullYear() + "/" + month + "/" + dt.getDate();
    var time = date + " " + dt.getHours() + ":" + (dt.getMinutes() + kTIMEOUT) + ":" + dt.getSeconds();
    
    return time;
  }

  function startTimer(time) {
    $('#clock').countdown(time)
      .on('update.countdown', function(event) {
          updateCountdown(event);
      })
      .on('finish.countdown', function(event) {
          $(this).html('00:0' + kTIMEOUT + ':00')
          .parent().addClass('disabled');

          if ( started ) {
            notifyMe();
            stopPressed();
          }
      });
  }

  function log(text, data) {
    console.log(">>> " + text);
    console.log(data);
  }

  function stopTimer() {
    startTimer("2000/10/28 10:28:00");
  }

  function addDivPlayers(data) {
    log("addDivPlayers", data);

    $("#players").empty();
    for ( var i=0; i<data.players.length; i++ ) {
        var player = data.players[i];
        $("#players").append('<div id="player' + player.name + '"><img class="circular" src="' + player.url + '" alt="' + player.name + '" /></div>');
    }

    $("#playersLogin #player" + player.name).empty();
  }

  function loginPressed(elem) {
    playerInfo = {
        name: elem.target.alt,
        url : elem.target.currentSrc
    };

    console.log(playerInfo);
    setUsername(playerInfo);
  }

  function playerSelected(elem) {
    if ( started ) return;
    var item = "#player" + elem.target.alt;

    playerInfo = {
      name: elem.target.alt,
      url : elem.target.currentSrc
    };

    toggleColor(item);
    socket.emit(kNEW_MESSAGE, item);
  }

  function startPressed() {
    $("#btnStart").prop('disabled', true);
    $("#btnStop").prop('disabled', false);

    var timez = deltaTime();
    socket.emit(kNEW_TIME, timez);
    startTimer(timez);

    started = true;
    socket.emit(kSTARTED, started);
  }

  function stopPressed() {
    $("#btnStop").prop('disabled', true);
    $("#btnStart").prop('disabled', false);

    started = false;
    socket.emit(kSTOPPED, started);
  }

  function notifyMe() {
    if (!Notification) {
      alert('Desktop notifications not available in your browser. Try Chrome.'); 
      return;
    }

    if (Notification.permission !== "granted")
      Notification.requestPermission();
    else {
      var notification = new Notification('Turn-Based socket!', {
        icon: 'https://dl.dropboxusercontent.com/u/11796049/BME/images/pin.png',
        body: "!!! your time is expired !!!",
      });

      notification.onclick = function () { };
    }
  }


  // -------------------------------------------------------------------------------------------
  // Main
  // -------------------------------------------------------------------------------------------


  stopTimer();

  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }


  // -------------------------------------------------------------------------------------------
  // Click events
  // -------------------------------------------------------------------------------------------


  $("#playersLogin").click(function (elem) {
    loginPressed(elem);
  });

  $("#players").click(function (elem) {
    playerSelected(elem);
  });

  $("#btnStart").click(function (elem) {
    startPressed();
  });

  $("#btnStop").click(function (elem) {
    stopPressed();
  });


  // -------------------------------------------------------------------------------------------
  // Socket events
  // -------------------------------------------------------------------------------------------


  socket.on(kLOGIN, function (data) {
    log(kLOGIN, data);
    addDivPlayers(data);
  });

  socket.on(kNEW_MESSAGE, function (data) {
    log(kNEW_MESSAGE, data);
    toggleColor(data.message);
  });

  socket.on(kNEW_TIME, function (data) {
    log(kNEW_TIME, data);
    startTimer(deltaTime(data.message));
  });

  socket.on(kNEW_PLAYER, function (data) {
    log(kNEW_PLAYER, data);
  });

  socket.on(kUSER_JOINED, function (data) {
    log(kUSER_JOINED, data);
    addDivPlayers(data);
  });

  socket.on(kUSER_LEFT, function (data) {
    log(kUSER_LEFT, data);
    addDivPlayers(data);
  });

  socket.on(kSTARTED, function (data) {
    log(kSTARTED, data);

    $("#btnStop").prop('disabled', !data);
    $("#btnStart").prop('disabled', data);

    started = true;
  });

  socket.on(kSTOPPED, function (data) {
    log(kSTOPPED, data);

    $("#btnStop").prop('disabled',  data);
    $("#btnStart").prop('disabled', data);
    $("#players").children().css('opacity', '1');

    started = false;
    stopTimer();
  });

});


