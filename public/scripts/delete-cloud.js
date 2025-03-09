//component deletes a cloud when its out of the users view
AFRAME.registerComponent('delete-cloud', {
    init: function () {
      const Context_AF = this;
      Context_AF.el.addEventListener('obbcollisionended', function(e) {
          e.detail.withEl.parentNode.removeChild(e.detail.withEl);
      })
    },
});
