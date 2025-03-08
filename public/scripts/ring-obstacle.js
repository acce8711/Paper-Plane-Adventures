AFRAME.registerComponent('ring-obstacle', {

    init: function () {
      
    },

    update: function () {
      // Do something when component's data is updated.

    },

    remove: function () {
      // Do something the component or its entity is detached.
    },

    tick: function (time, delta) {
      // Do something on every scene tick or frame.
      this.el.object3D.position.z = this.el.object3D.position.z + (0.01 * delta);
    }
});
