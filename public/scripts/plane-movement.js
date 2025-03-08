
AFRAME.registerComponent('plane-movement', {
  schema: {
      yPosFactor: {type: 'number'},
      xRotation: {type: 'number'}
  },

  init: function() {
    console.log("rotatioaijfasjfhsj", this.data.xRotation)
    console.log(this.el)
  },

  tick: function() {
    //add check to see if rotation and pos is different
    this.el.object3D.position.y = Math.max(-5, (Math.min(5, (this.el.object3D.position.y + this.data.yPosFactor))));
    this.el.object3D.rotation.x = this.data.xRotation;
  }
});
