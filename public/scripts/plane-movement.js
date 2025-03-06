
AFRAME.registerComponent('plane-movement', {
  schema: {
      yPosFactor: {type: 'number'},
      xRotation: {type: 'number', default: THREE.MathUtils.degToRad(-20)}
  },

  tick: function() {
    //add check to see if rotation and pos is different
    this.el.object3D.position.y = this.el.object3D.position.y + this.data.yPosFactor;
    this.el.object3D.rotation.x = this.data.xRotation;
  }
});
