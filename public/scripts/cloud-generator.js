AFRAME.registerComponent('cloud-generator', {

    init: function () {
        const Context_AF = this;
        Context_AF.scene = document.querySelector("a-scene");

        const cloudsGrp = document.createElement('a-entity');
        cloudsGrp.object3D.position.set(0, -8, -120);
        cloudsGrp.setAttribute('clouds', {});

        // const cloudCollider = document.createElement('a-entity');
        // cloudCollider.setAttribute('obb-collider', {size: '0.5 0.5 0.5'});
        // cloudCollider.object3D.position.set(0, 0, -60);
        // cloudCollider.className = "clouds";

        const cloudsEl = document.createElement('a-entity');
        cloudsEl.setAttribute('gltf-model', '#cloud_1_gltf');
        cloudsEl.setAttribute('obb-collider', {});
        cloudsEl.className = "clouds";
        cloudsEl.setAttribute('clouds', {});
        cloudsEl.object3D.position.set(0, -8, -80);

        const cloudsGrp1 = document.createElement('a-entity');
        cloudsGrp1.object3D.position.set(0, -8, -180);
        cloudsGrp1.setAttribute('clouds', {});

        // const cloudCollider1 = document.createElement('a-entity');
        // cloudCollider1.setAttribute('obb-collider', {size: '0.5 0.5 0.5'});
        // cloudCollider1.object3D.position.set(0, 0, -60);
        // cloudCollider1.className = "clouds";

        const cloudsEl1 = document.createElement('a-entity');
        cloudsEl1.setAttribute('gltf-model', '#cloud_1_gltf');
        cloudsEl1.setAttribute('obb-collider', {});
        cloudsEl1.className = "clouds";
        cloudsEl1.setAttribute('clouds', {});
        cloudsEl1.object3D.position.set(0, -8, -240);

       // cloudsGrp.append(cloudsEl, cloudCollider)
        Context_AF.scene.appendChild(cloudsEl);

        //cloudsGrp1.append(cloudsEl1, cloudCollider1)
        Context_AF.scene.appendChild(cloudsEl1);

        this.obbCo = setInterval(function() {
            const cloudsGrp2 = document.createElement('a-entity');
            cloudsGrp2.object3D.position.set(0, -8, -120);
            cloudsGrp2.setAttribute('clouds', {});

            const cloudCollider2 = document.createElement('a-entity');
            cloudCollider2.setAttribute('obb-collider', {size: '0.5 0.5 0.5'});
            cloudCollider2.object3D.position.set(0, 0, -60);
            cloudCollider2.className = "clouds";

            const cloudsEl2 = document.createElement('a-entity');
            cloudsEl2.setAttribute('gltf-model', '#cloud_1_gltf');


            cloudsGrp2.append(cloudsEl2, cloudCollider2)
            Context_AF.scene.appendChild(cloudsGrp2);
        }, 5500)
    },

    remove: function() {
        clearInterval(this.obbCo);
    }
});
