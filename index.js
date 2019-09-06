(function(win) {
  'use strict'

  win.onload = function() {
    var container = document.getElementById("container");
    var overlay = document.getElementById("overlay");
    var isDragging = false;
    setElementX(overlay, 0);
    setElementY(overlay, 0);

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
      return e.style.left = x + 'px';
    }

    function setElementY(e, y) {
      return e.style.top = y + 'px';
    }
  }
})(window);
