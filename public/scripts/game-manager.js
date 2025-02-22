//component manages the game states
AFRAME.registerComponent('game-manager', {
    schema: {
        
    },

    init: function () {
      const Context_AF = this;
      Context_AF.device = AFRAME.utils.device.isMobile() ? DEVICES.mobile : DEVICES.desktop;
      Context_AF.leadPlayer = false;

      Context_AF.loadingActions = loadingActions;


      const socket = io();

            socket.on('connect', (userData) => {

                // //put code here so that we know that socket.io has initailized ...
                document.querySelector('#testObj').addEventListener('click', function(){
                    console.log("emit")
                    socket.emit('red');
                });

                // document.querySelector('#blue_button').querySelector('.button').addEventListener('click', function(){
                //     socket.emit('blue');
                // });
            });

            // get global starter data
            socket.on('starter_data', (data) => {
              console.log("num players:",data.length)
              //if there is only one other player and they are on a different device then then send player data to server
              if(data.length === 1)
              {
                //if an existing player is already using the same device then the current player must join on a different device
                console.log("data ", data)
                if(data[0].device !== Context_AF.device)
                {
                  const unusedDevice = Context_AF.device === DEVICES.mobile ? DEVICES.desktop : DEVICES.mobile;
                  console.log("Player 1 is already using ", Context_AF.device, ". Please use ", unusedDevice);
                }
                //if the players are on different devices then the game can begin
                else{
                  console.log("it's diff")
                  socket.emit('player_ready', {device: Context_AF.device})
                }
              }
              else if(data.length === 0){
                Context_AF.leadPlayer = true;
                console.log("it's diff 2")
                socket.emit('player_ready', {device: Context_AF.device})
              }
            });

            // //listen to event from server
            socket.on('color_change', (data) => {
                let colorStr = 'rgb(' + data.r + ',' + data.g + ',' + data.b + ')';
                console.log('color_change:' + colorStr);
                //document.body.style.backgroundColor = colorStr;
            });

            socket.on('hello', (data) => {
              console.log(data);
              //document.body.style.backgroundColor = colorStr;
          });

          //socket listens if players can start playing
          socket.on('playing', (data) => {
            switch (data) {
              case "modeSelection":
                  document.querySelector("#loading").style.display = "none";
                  document.querySelector("#modeSelection").style.display = "block";
                  if(Context_AF.leadPlayer)
                  {
                    document.querySelector("#selectionButtons").style.display = "block";
                  }
                  else
                    console.log("I am waiting for mode selection");
                  break;
              case "loading":
                  Context_AF.loadingActions(Context_AF);
              default:
                  break;
            }

            console.log("data speical: ",data);
            //document.body.style.backgroundColor = colorStr;
        });
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

const desktopScene = function() {

}

const mobileScene = function() {

}

//function handles the actions that need to happen when the game state is loading
const loadingActions = function(Context_AF) {
  console.log("looks like we're waiting for player");
  //updating the lead player to be the player who is waiting
  //may need to be an emmited event from server side instead
  Context_AF.leadPlayer = true;
  console.log(Context_AF.leadPlayer);

  document.querySelector("#loading").style.display = "block";
  document.querySelector("#modeSelection").style.display = "none";

  
}

