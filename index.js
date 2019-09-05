(function(win) {
  'use strict'

  win.onload = function() {
    var overlay = document.getElementById("overlay");
    var isDown = false;
    setElementX(overlay, 0);
    setElementY(overlay, 0);

    overlay.addEventListener('mousedown', handleMouseDonw, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    document.addEventListener('mousemove', handleMoveEvent, false);

    function handleMouseDonw() {
      isDown = true;
    }

    function handleMouseUp() {
      isDown = false;
    }

    function handleMoveEvent(event) {
      if (!isDown) {
        return;
      }

      var x = getElementX(overlay);
      var y = getElementY(overlay);
      var dx = event.movementX;
      var dy = event.movementY;
      setElementX(overlay, x + dx);
      setElementY(overlay, y + dy);
    }

    function getElementX(e) {
      return parseInt(e.style.left.slice(0, -2));
    }

    function setElementX(e, x) {      
      return e.style.left = x + 'px';
    }

    function getElementY(e) {
      return parseInt(e.style.top.slice(0, -2));
    }

    function setElementY(e, y) {
      return e.style.top = y + 'px';
    }
  }
})(window);
