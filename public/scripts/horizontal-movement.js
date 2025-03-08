AFRAME.registerComponent('horizontal-movement', {
    schema: {
        enabled: {type: 'boolean', default: false},
        xFactor: {type: 'number'}
    },

    init: function () {
      // Do something when component first attached.
      this.factor = 0.005;
    },

    update: function () {
      // Do something when component's data is updated.
    },

    remove: function () {
      // Do something the component or its entity is detached.
    },

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
      if(this.data.enabled)
      {
            this.el.object3D.position.x = Math.max(-5, (Math.min(5, (this.el.object3D.position.x + (this.data.xFactor * 0.005 * timeDelta)))));
        }
    }

});
