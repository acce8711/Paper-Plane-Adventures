AFRAME.registerComponent('clouds', {
    init: function() {
      const Context_AF = this;
      Context_AF.collideHandler = function(e) {
        Context_AF.el.parentNode.removeChild(Context_AF.el);
      }

      //Context_AF.el.addEventListener('obbcollisionended', Context_AF.collideHandler)
    },

    tick: function() {
      //add check to see if rotation and pos is different
      this.el.object3D.position.z += 0.1;
    }
  });
  