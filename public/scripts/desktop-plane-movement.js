AFRAME.registerComponent("desktop-plane-movement", {
    init: function() {
        Context_AF = this;
        Context_AF.plane = document.querySelector("#plane");
        Context_AF.yPosFactor = 0;
        Context_AF.planeXRotation = THREE.MathUtils.degToRad(-20);

        this.changeState = changeState
        console.log("hello i am new")
    },

    tick: function() {
        //add check to see if rotation and pos is different
        Context_AF.plane.object3D.position.y = Context_AF.plane.object3D.position.y + Context_AF.yPosFactor;
        Context_AF.plane.object3D.rotation.x = Context_AF.planeXRotation
    },

    remove: function() {

    }
})

function changeState(propertyName, propertyValue) {
    Context_AF[propertyName] = propertyValue;
}