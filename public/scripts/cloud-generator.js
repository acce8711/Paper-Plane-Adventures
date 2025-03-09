//component is responsible for creating clouds while the game is running
AFRAME.registerComponent('cloud-generator', {

    init: function () {
        const Context_AF = this;
        Context_AF.scene = document.querySelector("a-scene");

        const cloudEl1 = createCloud(-80);
        const cloudEl2 = createCloud(-240);

        Context_AF.scene.appendChild(cloudEl1);
        Context_AF.scene.appendChild(cloudEl2);

        //generate a cloud every 5.5 seconds
        this.cloudGenerator = setInterval(function() {
            const cloudEl = createCloud(-120);
            Context_AF.scene.appendChild(cloudEl);
        }, 5500)
    },

    remove: function() {
        clearInterval(this.cloudGenerator);
    }
});

//function creates a cloud element
function createCloud(posZ) {
    const cloudsEl = document.createElement('a-entity');
    cloudsEl.setAttribute('gltf-model', '#cloud_1_gltf');
    cloudsEl.setAttribute('obb-collider', {});
    cloudsEl.className = 'clouds';
    cloudsEl.setAttribute('cloud-movement', {});
    cloudsEl.object3D.position.set(CLOUD_POS.x, CLOUD_POS.y, posZ);
    return cloudsEl
}