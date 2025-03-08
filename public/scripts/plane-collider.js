AFRAME.registerComponent('plane-collider', {
    init: function () {
      const Context_AF = this;
      Context_AF.collideHandler = function(e) {
        //dispatch event if the plane collides with a non-ghost obstacle
        if(e.detail.withEl.classList.contains("regularObstacle")) {
          const event = new CustomEvent("scoreUpdate");
          Context_AF.el.dispatchEvent(event);
        }
        
      }

      //event listener for collisions between the plane and obstacles
      Context_AF.el.addEventListener('obbcollisionstarted', Context_AF.collideHandler)
    },

    // remove: function () {
    //   console.log("destroy even, ", Context_AF);
    //   Context_AF.el.removeEventListener('obbcollisionstarted', Context_AF.collideHandler)
    // }
});

