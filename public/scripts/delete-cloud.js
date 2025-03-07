AFRAME.registerComponent('delete-cloud', {

    init: function () {
      const Context_AF = this;
      Context_AF.el.addEventListener('obbcollisionstarted', function(e) {
          console.log("clouds removal, ",e.detail.withEl)
          e.detail.withEl.parentNode.parentNode.removeChild(e.detail.withEl.parentNode);
      })

      
    },
});
