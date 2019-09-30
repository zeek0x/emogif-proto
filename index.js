(function(win) {
  'use strict'

  win.onload = function() {
    // global
    var SlackEmojiKB = 128;
    var SlackEmojiPx = 128;
    var timeUnit = 0.1;
    var table = document.getElementById('table');
    var fps = document.getElementById('fps');
    var scale = document.getElementById('scale');
    var timer = document.getElementById('timer');
    var start = document.getElementById('start');
    var end = document.getElementById('end');
    var container = document.getElementById('container');
    var overlay = document.getElementById('overlay');
    var corner = document.getElementById('corner');
    var video = document.getElementById('video');
    var source = document.getElementById('source');
    var isDragging = false;
    var isCornerDragging = false;

    init();

    function init() {
      var urlParams = new URLSearchParams(window.location.search);
      source.src = decodeURI(urlParams.get('uri'));
      video.load();
    }

    // ============================================================
    // Element Style
    // ============================================================

    video.addEventListener('loadeddata', handleLoadeddataEvent, false);

    function handleLoadeddataEvent(event) {
      fps.value = 10;
      fps.min = scale.min = 1;
      fps.max = 30; // TODO: set the video fps
      scale.max = getMinVideoLength(video);
      timer.value = start.value = 0;
      timer.min = start.min = end.min = 0;
      timer.max = start.max = end.max = parseInt(video.duration) / timeUnit;
      setElementW(table, video.clientWidth);
      setElementX(overlay, 0);
      setElementY(overlay, 0); 
      setCornerPosition();
    }

    // ============================================================
    // Timer
    // ============================================================

    timer.addEventListener('input', handleInputEvent, false);
    start.addEventListener('input', handleInputEvent, false);
    end.addEventListener('input', handleInputEvent, false);
    video.addEventListener('click', handleClickEvent, false);

    // Custom Property for 'Video is Playing'
    Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
      get: function() {
        return this.currentTime > 0 && !this.paused && !this.ended;
      }
    });

    function handleInputEvent(event) {
      video.currentTime = parseInt(this.value) * timeUnit;
    }

    function handleClickEvent(event) {
      video.playing ? video.pause() : video.play();
      timer.value = video.currentTime / timeUnit;
    }

    // ============================================================
    // Drag Move
    // ============================================================

    overlay.addEventListener('mousedown', handleOverlayMouseDonw, false);
    corner.addEventListener('mousedown', handleCornerMouseDown, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    document.addEventListener('mousemove', handleMoveEvent, false);

    function handleOverlayMouseDonw(event) {
      if(event.which === 1) {
        isDragging = true;
      }
    }

    function handleCornerMouseDown(event) {
      if(event.which === 1) {
        isCornerDragging = true;
      }
    }

    function handleMouseUp(event) {
      if(event.which === 1) {
        isDragging = false;
        isCornerDragging = false;
      }
    }

    function handleMoveEvent(event) {
      if (isDragging) {
        move(event);
      }

      if (isCornerDragging) {
        zoom(event);
      }
    }

    function move(event) {
      var p = getPosition(overlay, container);
      var dx = event.movementX;
      var dy = event.movementY;
      setElementX(overlay, p.x + dx);
      setElementY(overlay, p.y + dy);
      setCornerPosition(overlay);
    }

    function zoom(event) {
      var s = getSize(overlay, container);
      var dx = event.movementX;
      setElementW(overlay, s.w + dx);
      setElementH(overlay, s.w + dx);
      setCornerPosition(overlay);
    } 

    function setCornerPosition() {
      var p = getPosition(overlay, container);
      var os = getSize(overlay);       
      var cs = getSize(corner);
      
      setElementX(corner, p.x + os.w - cs.w);
      setElementY(corner, p.y + os.h - cs.h);
    }

    // ============================================================
    // Menu
    // ============================================================

    var remote = require('electron').remote;
    var MenuItem = remote.MenuItem;
    var template = [
      { label: 'Crop', click: handleCrop },
      { type: 'separator'},
      { label: `Set Scale: ${SlackEmojiPx}px`, click: handleScale },
      { type: 'separator'},
      { label: 'Reload', click: handleReload},
      { label: 'Back', click: handleBack}
    ];
    var menu = remote.Menu.buildFromTemplate(template);
 
    win.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      menu.popup(remote.getCurrentWindow());
    }, false);

    function handleCrop(event) {
      var s = getSize(overlay);
      var p = getPosition(overlay, container);

      var input = source.src;
      var ss = parseInt(start.value) * timeUnit;
      var duration = (parseInt(end.value) - parseInt(start.value)) * timeUnit;
      var x = p.x;
      var y = p.y;
      var w = s.w;
      var h = s.h;
      var _fps = parseInt(fps.value);
      var _scale = parseInt(scale.value);

      var option = cropOption(input, ss, duration, x, y, w, h, _fps, _scale);
      var output = './output.gif';
      cropExec(option, output);
      showResult(option, output, _scale);
    }

    function handleScale(params) {
      scale.value = SlackEmojiPx + '';
    }

    function handleReload(params) {
      video.load();
    }

    function handleBack(params) {
      window.history.back();
    }

    // ============================================================
    // Result
    // ============================================================

    function showResult(option, output, filePx) {
      var fileSizeKB = getFileSize(output) / 1024;

      if(fileSizeKB > SlackEmojiKB || filePx > SlackEmojiPx) {
        var msg = `Resolution: ${filePx}x${filePx}\n` +
                  `Filesize : ${fileSizeKB.toFixed(2)} [KB]\n` +
                  '\nSlack Emoji "gif" Condition\n' +
                  `  Resolution < ${SlackEmojiPx}x${SlackEmojiPx}\n` +
                  `  Filesize < ${SlackEmojiKB} KB`;
        alert(msg);
      }

      console.log(option);
      window.open(output);
    }

    // ============================================================
    // Element Util
    // ============================================================

    function getMinVideoLength(elem) {
      var w = elem.videoWidth;
      var h = elem.videoHeight;
      return w < h ? w : h;
    }

    function getSize(elem) {      
      var rect = elem.getBoundingClientRect();
      var w = rect.width;
      var h = rect.height;
      return {w, h};
    }

    function getPosition(child, parent) {
      var rect1 = child.getBoundingClientRect();
      var rect2 = parent.getBoundingClientRect();
      var x = rect1.x - rect2.x;
      var y = rect1.y - rect2.y;
      return {x, y};
    }

    function setElementX(e, x) {      
      e.style.left = x + 'px';
    }

    function setElementY(e, y) {
      e.style.top = y + 'px';
    }

    function setElementW(e, w) {
      e.style.width = w + 'px';
    }

    function setElementH(e, h) {      
      e.style.height = h + 'px';
    }
  }
})(window);
