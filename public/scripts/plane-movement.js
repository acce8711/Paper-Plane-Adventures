//component updates the vertical plane movement and x rotation
AFRAME.registerComponent('vertical-plane-movement', {
  schema: {
      yPosFactor: {type: 'number'},
      xRotation: {type: 'number'}
  },

  tick: function(time, timeDelta) {
    //update the factor to match framerate
    const frameRateFactor = this.data.yPosFactor * timeDelta;
    this.el.object3D.position.y = Math.max(MIN_MAX_POS.minY, (Math.min(MIN_MAX_POS.maxY, (this.el.object3D.position.y + frameRateFactor))));
    this.el.object3D.rotation.x = this.data.xRotation;
  }
});
