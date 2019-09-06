(function(win) {
  'use strict'

  win.onload = function() {
    var container = document.getElementById("container");
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

      var rect1 = overlay.getBoundingClientRect();
      var rect2 = container.getBoundingClientRect();
      var x = rect1.x - rect2.x;
      var y = rect1.y - rect2.y;
      var dx = event.movementX;
      var dy = event.movementY;
      setElementX(overlay, x + dx);
      setElementY(overlay, y + dy);
    }

    function setElementX(e, x) {      
      return e.style.left = x + 'px';
    }

    function setElementY(e, y) {
      return e.style.top = y + 'px';
    }
  }
})(window);
