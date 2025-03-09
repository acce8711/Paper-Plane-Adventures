//component listens for plane collision event with a regular obstacle and emits and event to update the score
AFRAME.registerComponent('plane-collider', {
    init: function () {
      const Context_AF = this;
      Context_AF.collideHandler = function(e) {
        //dispatch event if the plane collides with a non-ghost obstacle
        if(e.detail.withEl.classList.contains('regularObstacle')) {
          const event = new CustomEvent('scoreUpdate');
          Context_AF.el.dispatchEvent(event);
        }
      }
      
      //event listener for collisions between the plane and obstacles
      Context_AF.el.addEventListener('obbcollisionstarted', Context_AF.collideHandler);
    }
});

