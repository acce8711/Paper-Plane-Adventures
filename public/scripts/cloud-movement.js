//component updates the cloud movement every frame
AFRAME.registerComponent('cloud-movement', {
tick: function(time, timeDelta) {
      this.el.object3D.position.z += (0.02 * timeDelta);
    }
});
  