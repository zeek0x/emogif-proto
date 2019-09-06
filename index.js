(function(win) {
  'use strict'

  win.onload = function() {
    // global
    var container = document.getElementById("container");
    var overlay = document.getElementById("overlay");
    var video = document.getElementById("video");
    var source = document.getElementById("source");
    var isDragging = false;
    setElementX(overlay, 0);
    setElementY(overlay, 0);

    // ============================================================
    // Drag Move
    // ============================================================

    overlay.addEventListener('mousedown', handleMouseDonw, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    document.addEventListener('mousemove', handleMoveEvent, false);

    function handleMouseDonw(event) {
      if(event.which === 1) {
        isDragging = true;
      }
    }

    function handleMouseUp(event) {
      if(event.which === 1) {
        isDragging = false;
      }
    }

    function handleMoveEvent(event) {
      if (!isDragging) {
        return;
      }

      var p = getPosition(overlay, container);
      var dx = event.movementX;
      var dy = event.movementY;
      setElementX(overlay, p.x + dx);
      setElementY(overlay, p.y + dy);
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
      var start = 0;
      var duration = 10;
      var x = p.x
      var y = p.y
      var w = s.w;
      var h = s.h;

      var option = cropOption(input, start, duration, x, y, w, h);
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
      return e.style.left = x + 'px';
    }

    function setElementY(e, y) {
      return e.style.top = y + 'px';
    }
  }
})(window);
