AFRAME.registerComponent('element-generator', {

    init: function () {

      const Context_AF = this;
      Context_AF.scene = document.querySelector("a-scene");
      Context_AF.plane = document.querySelector("#plane");
      // Do something when component first attached.
      const intervalId = setInterval(function() {
        //create a ring
        const obstacleEl = document.createElement("a-ring");
        obstacleEl.setAttribute('ring-obstacle', {});
        obstacleEl.setAttribute('obb-collider', {});
        obstacleEl.object3D.position.set(Math.floor(Math.random() * 10 - 5), 0, -50)
        Context_AF.scene.appendChild(obstacleEl);
      }, 6000)

      
    },

    update: function () {
      // Do something when component's data is updated.
    },

    remove: function () {
      // Do something the component or its entity is detached.
    },

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
    }
});
