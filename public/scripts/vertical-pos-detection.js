//component listens for a change in the camera z rotation to update the y pos
AFRAME.registerComponent('vertical-pos-detection', {
    init: function () {
        Context_AF = this;
        Context_AF.camera = document.querySelector("#camera");
        Context_AF.plane = document.querySelector("#plane");
        Context_AF.yPosFactor = 0;           
    },

    tick: function(time, timeDelta) {
        const rotation = Context_AF.camera.object3D.rotation.x;

        //update the amount the camera y position is being updated each frame
        Context_AF.yPosFactor = MOVEMENT_MULT * rotation;
        const event = new CustomEvent("xRotation", {
            detail: {
                planeXRotation: (-1) * rotation,
                planeYPosFactor: Context_AF.yPosFactor 
            }
        });
        Context_AF.camera.dispatchEvent(event);

        //scale the factor to match framerate
        const frameRateFactor = Context_AF.yPosFactor * timeDelta;
        Context_AF.camera.object3D.position.y = Math.max(MIN_MAX_POS.minY,(Math.min(MIN_MAX_POS.maxY, (Context_AF.camera.object3D.position.y + frameRateFactor))));
    },

    remove: function() {
        clearInterval(Context_AF.intervalId);
    }
});