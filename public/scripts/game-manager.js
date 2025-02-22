
//component manages the game states
AFRAME.registerComponent('game-manager', {
    schema: {
        
    },

    init: function () {
      const Context_AF = this;

      //game logic variables
      Context_AF.device = AFRAME.utils.device.isMobile() ? DEVICES.mobile : DEVICES.desktop;
      Context_AF.playerId = "";

      //UI variables
      Context_AF.waitingUI = document.querySelector('#waitingUI');
      Context_AF.modeSelectionUI = document.querySelector('#modeSelectionUI');
      Context_AF.modeSelectionButtons = document.querySelector('#modeSelectionButtons');
      Context_AF.competitiveModeButton = document.querySelector('#competitiveModeButton');
      Context_AF.collaborativeModeButton = document.querySelector('#collaborativeModeButton');

      const socket = io();

            socket.on('connect', (userData) => {
                //add an event listener for the competitive mode button when socket.io has been initialized
                Context_AF.competitiveModeButton.addEventListener('click', function(){
                    socket.emit('mode_selected', 'competitive');
                });

                //add an event listener for the collaborative mode button when socket.io has been initialized
                Context_AF.collaborativeModeButton.addEventListener('click', function(){
                  socket.emit('mode_selected', 'collaborative');
                });
            });

            // get global starter data
            socket.on('starter_data', (data) => {
              //if there is only one other player and they are on a different device then then send player data to server
              console.log("data len: ", data.players.length)
              if(data.players.length === 1)
              {
                //if an existing player is already using the same device then the current player must join on a different device
                if(data.players[0].device !== Context_AF.device)
                {
                  const unusedDevice = Context_AF.device === DEVICES.mobile ? DEVICES.desktop : DEVICES.mobile;
                  console.log("Player 1 is already using ", Context_AF.device, ". Please use ", unusedDevice);
                }
                //if the players are on different devices then the game can begin
                else{
                  console.log("it's diff");
                  Context_AF.playerId = data.socketId;
                  socket.emit('player_ready', {device: Context_AF.device})
                }
              }
              else if(data.players.length === 0){
                console.log("it's diff 2")
                Context_AF.playerId = data.socketId;
                socket.emit('player_ready', {device: Context_AF.device})
              }
            });

            //if the other player leaves the game, then put the current player into a waiting state
            socket.on('waiting', (data) => {
              console.log(Context_AF.playerId === data.leadPlayer ? "I am the lead player" : "I am not the lead player")
              //hide the currently displayed UI
              const activeUI = document.querySelector(".activeUI");
              for(uiElement in activeUI) {
                uiElement.style.display = HIDE_UI;
                uiElement.classList.remove("activeUI");
              }
              //display the loading UI
              Context_AF.waitingUI.style.display = SHOW_UI;
            })

            //listen for when both players are ready to begin mode selection
            socket.on('mode_selection', (data) => {
              console.log("Plyaer id: ", Context_AF.playerId, " lead player id: ", data)
              console.log(Context_AF.playerId === data ? "I am selecting the mode" : "I am waiting for the mode to be selected")
              //hide the currently displayed UI
              Context_AF.waitingUI.style.display = "none";
              //display the mode selection UI
              Context_AF.modeSelectionUI.style.display = SHOW_UI;
              Context_AF.modeSelectionUI.classList.add("activeUI");
              //display the mode selection buttons if the current player is a lead player
              if(Context_AF.playerId === data)
                {
                  Context_AF.modeSelectionButtons.style.display = SHOW_UI;
                  Context_AF.modeSelectionButtons.classList.add("activeUI");
                }
            })

          //listens if the player is waiting for another player

          //listens if the player cna 
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

