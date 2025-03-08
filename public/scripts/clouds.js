AFRAME.registerComponent('clouds', {
    init: function() {
      const Context_AF = this;

      //Context_AF.el.addEventListener('obbcollisionended', Context_AF.collideHandler)
    },

    tick: function(time, delta) {
      //add check to see if rotation and pos is different
      this.el.object3D.position.z += (0.02 * delta);
    }
  });
  