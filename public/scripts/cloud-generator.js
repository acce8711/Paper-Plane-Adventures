AFRAME.registerComponent('cloud-generator', {

    init: function () {
        const Context_AF = this;
        Context_AF.scene = document.querySelector("a-scene");
        const cloudsEl = document.createElement('a-entity');
        cloudsEl.setAttribute('gltf-model', '#cloud_1_gltf');
        cloudsEl.setAttribute('obb-collider', {});
        cloudsEl.setAttribute('clouds', {});
        cloudsEl.object3D.position.set(0, -7, 0);
        Context_AF.scene.appendChild(cloudsEl);

        // const moveX = setInterval(function() {
        //     console.log("hello")
        //     const cloudsEl = document.createElement('a-entity');
        //     cloudsEl.setAttribute('gltf-model', '#cloud_1_gltf');
        //     cloudsEl.setAttribute('obb-collider', {});
        //     cloudsEl.setAttribute('clouds', {});
        //     cloudsEl.object3D.position.set(0, -7, -130);
        //     Context_AF.scene.appendChild(cloudsEl);
        // }, 5000)
    },
});
