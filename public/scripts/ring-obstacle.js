//component updates the ring position every frame
AFRAME.registerComponent('ring-obstacle', {
    tick: function (time, timeDelta) {
      this.el.object3D.position.z = this.el.object3D.position.z + (MOVEMENT_MULT * timeDelta);
    }
});
