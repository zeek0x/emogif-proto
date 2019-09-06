(function(win) {
  'use strict'

  win.onload = function() {
    // global
    var timeUnit = 0.5;
    var timer = document.getElementById("timer");
    var start = document.getElementById("start");
    var end = document.getElementById("end");
    var container = document.getElementById("container");
    var overlay = document.getElementById("overlay");
    var corner = document.getElementById("corner");
    var video = document.getElementById("video");
    var source = document.getElementById("source");
    var isDragging = false;
    var isCornerDragging = false;

    init();

    function init() {
      timer.min = start.min = end.min = 0;
      timer.max = start.max = end.max = parseInt(video.duration) / timeUnit;
      timer.steps = start.steps = end.steps = parseInt(video.duration) / timeUnit;
      setElementW(timer, video.clientWidth);
      setElementW(start, video.clientWidth);
      setElementW(end, video.clientWidth);
      setElementX(overlay, 0);
      setElementY(overlay, 0); 
      setCornerPosition();
    }

    // ============================================================
    // Slider
    // ============================================================

    start.addEventListener("input", handleInputEvent, false);
    end.addEventListener("input", handleInputEvent, false);
    video.addEventListener("click", handleClickEvent, false);

    // Custom Property for "Video is Playing"
    Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
      get: function() {
        return this.currentTime > 0 && !this.paused && !this.ended;
      }
    });

    function handleInputEvent(event) {
      video.currentTime = parseInt(this.value) * timeUnit;
    }

    function handleClickEvent() {
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
      move(event);
      zoom(event);
    }

    function move(event) {
      if (!isDragging) {
        return;
      }

      var p = getPosition(overlay, container);
      var dx = event.movementX;
      var dy = event.movementY;
      setElementX(overlay, p.x + dx);
      setElementY(overlay, p.y + dy);
      setCornerPosition(overlay);
    }

    function zoom(event) {
      if (!isCornerDragging) {
        return;
      }

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
    var Menu = remote.Menu;
    var MenuItem = remote.MenuItem;
    var template = [
      { label: 'crop', click: handleCrop },
    ];
    const menu = Menu.buildFromTemplate(template);
 
    win.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      menu.popup(remote.getCurrentWindow());
    }, false);

    function handleCrop() {
      var s = getSize(overlay);
      var p = getPosition(overlay, container);

      var input = source.src;
      var ss = parseInt(start.value) * timeUnit;
      var duration = parseInt(start.value) - parseInt(end.value) * timeUnit;
      var x = p.x;
      var y = p.y;
      var w = s.w;
      var h = s.h;

      var option = cropOption(input, ss, duration, x, y, w, h);
      cropExec(option, "./output.gif");
    }

    // ============================================================
    // Element Util
    // ============================================================

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
