//component updates the x position of a plane or a camera
AFRAME.registerComponent('horizontal-movement', {
    schema: {
        enabled: {type: 'boolean', default: false},
        xFactor: {type: 'number'}
    },

    init: function () {
      this.factor = HORIZONTAL_MOVEMENT_MULT;
    },

    tick: function (time, timeDelta) {
      if(this.data.enabled)
        this.el.object3D.position.x = Math.max(MIN_MAX_POS.minX, (Math.min(MIN_MAX_POS.maxX, (this.el.object3D.position.x + (this.data.xFactor * 0.005 * timeDelta)))));
    }
});
