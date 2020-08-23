(function(win) {
  'use strict'

  win.onload = function() {
    // global
    var SlackEmojiKB = 128;
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
      var sourceUri = urlParams.get('uri');

      if (sourceUri === null) {
        return;
      }

      source.src = decodeURI(sourceUri);
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
      scale.max = 100; // [%]
      timer.value = start.value = 0;
      timer.min = start.min = end.min = 0;
      timer.max = start.max = end.max = parseInt(video.duration) / timeUnit;
      setElementW(table, video.clientWidth);
      setElementX(overlay, 0);
      setElementY(overlay, 0);
      setBottomRight(corner);
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
      if (isCornerDragging) {
        zoom(event);
        return;
      }

      if (isDragging) {
        move(event);
      }
    }

    function move(event) {
      var p = getPosition(overlay);
      var dx = event.movementX;
      var dy = event.movementY;
      setElementX(overlay, p.x + dx);
      setElementY(overlay, p.y + dy);
      setBottomRight(corner);
    }

    function zoom(event) {
      var s = getSize(overlay);
      var dx = event.movementX;
      setElementW(overlay, s.w + dx);
      setElementH(overlay, s.w + dx);
      setBottomRight(corner);
    }

    function setBottomRight(child, parent = child.parentNode) {
      var ps = getSize(parent);
      var cs = getSize(child);
      setElementX(child, ps.w - cs.w);
      setElementY(child, ps.h - cs.h);
    }

    // ============================================================
    // Menu
    // ============================================================

    var remote = require('electron').remote;
    var Menu = remote.Menu;
    var template = [
      { label: 'Crop', click: handleCrop },
      { type: 'separator'},
      { label: 'Reload', click: handleReload},
      { label: 'Back', click: handleBack}
    ];
    const menu = Menu.buildFromTemplate(template);

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
      var _scale = parseInt(getMaxVideoLength(video) * parseInt(scale.value) / 100);

      var option = cropOption(input, ss, duration, x, y, w, h, _fps, _scale);
      var output = './output.gif';
      cropExec(option, output);
      showResult(option, output);
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

    function showResult(option, output) {
      var fileSizeKB = getFileSize(output) / 1024;

      if(fileSizeKB > SlackEmojiKB) {
        var msg = `Too BIG File!!! Filesize: ${fileSizeKB.toFixed(2)} [KB]\n` +
                  'To upload this file will be falied.\n' +
                  'Adjust FPS or SCALE or START_AND_END';
        alert(msg);
      }

      console.log(option);
      window.open(output);
    }

    // ============================================================
    // Element Util
    // ============================================================

    function getMaxVideoLength(elem) {
      var w = elem.videoWidth;
      var h = elem.videoHeight;
      return w > h ? w : h;
    }

    function getSize(elem) {
      var rect = elem.getBoundingClientRect();
      var w = rect.width;
      var h = rect.height;
      return {w, h};
    }

    function getPosition(child, parent = child.parentNode) {
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
