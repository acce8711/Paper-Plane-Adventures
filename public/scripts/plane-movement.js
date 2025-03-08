
AFRAME.registerComponent('plane-movement', {
  schema: {
      yPosFactor: {type: 'number'},
      xRotation: {type: 'number'}
  },

  init: function() {
    console.log("rotatioaijfasjfhsj", this.data.xRotation)
    console.log(this.el)
  },

  tick: function(time, delta) {
    //add check to see if rotation and pos is different
    const frameRateFactor = this.data.yPosFactor * delta;
    this.el.object3D.position.y = Math.max(-5, (Math.min(5, (this.el.object3D.position.y + frameRateFactor))));
    this.el.object3D.rotation.x = this.data.xRotation;
  }
});
