AFRAME.registerComponent('delete-cloud', {

    init: function () {
      const Context_AF = this;
      Context_AF.el.addEventListener('obbcollisionended', function(e) {
          console.log("clouds removal, ",e.detail.withEl.parentNode)
          e.detail.withEl.parentNode.removeChild(e.detail.withEl);
      })

      
    },
});
