
//component manages the game states
AFRAME.registerComponent('game-manager', {
    schema: {
        
    },

    init: function () {
      const Context_AF = this;

      //game logic variables
      Context_AF.device = AFRAME.utils.device.isMobile() ? DEVICES.mobile : DEVICES.desktop;
      Context_AF.playerId = "";
      Context_AF.isLeadPlayer = false;
      Context_AF.mode = "";
      Context_AF.horizontalMovement = false;
      Context_AF.scene = document.querySelector("a-scene");
      Context_AF.particlesRightSide = document.querySelector("#particlesRightSide");
      Context_AF.particlesLeftSide = document.querySelector("#particlesLeftSide");

      //UI variables
      Context_AF.lobbyUI = document.querySelector('#lobbyMessage');

      Context_AF.incorrectDeviceUI = document.querySelector('#incorrectDevice');
      Context_AF.devicePlaceholder = document.querySelector('#devicePlaceHolder');
      Context_AF.otherDevicePlaceholder = document.querySelector('#otherDevicePlaceHolder');
      
      Context_AF.waitingUI = document.querySelector('#waitingUI');

      Context_AF.modeSelectionUI = document.querySelector('#modeSelectionUI');
      Context_AF.modeSelectionTitle = document.querySelector('#modeSelection');
      Context_AF.modeSelectionButtons = document.querySelector('#modeSelectionButtons');
      Context_AF.competitiveModeButton = document.querySelector('#competitiveModeButton');
      Context_AF.collaborativeModeButton = document.querySelector('#collaborativeModeButton');
      Context_AF.modeSelectionWaitingUI = document.querySelector('#modeSelectionWaiting');

      Context_AF.instructionsUI = document.querySelector('#instructionsUI');
      Context_AF.selectedModePlaceholder = document.querySelector('#selectedModePlaceholder');
      Context_AF.desktopPlayerInstructionsUI = document.querySelector('#desktopPlayer');
      Context_AF.collabDesktopPlayerInstructionsUI = document.querySelector('#collabInstructionDesktop');
      Context_AF.mobilePlayerInstructionsUI = document.querySelector('#mobilePlayer');
      Context_AF.collabMobilePlayerInstructionsUI = document.querySelector('#collabInstructionMobile');
      Context_AF.continueButton = document.querySelector('#continueButton');
      Context_AF.continueWaitingUI = document.querySelector('#instructionsWaiting');

      Context_AF.playingUI = document.querySelector('#playingUI');
      Context_AF.timerPlaceholder = document.querySelector('#timerPlaceholder');
      Context_AF.scorePlaceholder = document.querySelector('#scorePlaceholder');
      Context_AF.opponentScoreUI = document.querySelector('#opponentScore');
      Context_AF.opponentScorePlaceholder = document.querySelector('#opponentScorePlaceholder');
      Context_AF.horizontalControlsUI = document.querySelector('#horizontalControl');

      Context_AF.gameOverUI = document.querySelector('#gameOverUI');
      Context_AF.scoreGameOverUI = document.querySelector('#scoreGameOver');
      Context_AF.opponentScoreGameOverUI = document.querySelector('#opponentScoreGameOver');

      Context_AF.score = 0;
      Context_AF.opponentScore = 0;
      Context_AF.opponentPlanePos = {x:0, y:0, z:0};

      

      const socket = io();

            socket.on('connect', (userData) => {
                //add an event listener for the competitive mode button that listens if a competitive mode has been selected
                Context_AF.competitiveModeButton.addEventListener('click', function(){
                    Context_AF.mode = 'competitive';
                    socket.emit('mode_selected', 'competitive');
                });

                //add an event listener for the collaborative mode button that listens if a collaborative mode has been selected
                Context_AF.collaborativeModeButton.addEventListener('click', function(){
                  Context_AF.mode = 'collaborative';
                  socket.emit('mode_selected', 'collaborative');
                });

                //add an event listener for the continue button that listens for when a player is ready to continue playing
                Context_AF.continueButton.addEventListener('click', function(){
                  Context_AF.continueButton.style.display = HIDE_UI;
                  Context_AF.continueButton.classList.remove('activeUI');
                  Context_AF.continueWaitingUI.style.display = SHOW_UI;
                  Context_AF.continueWaitingUI.classList.add('activeUI');
                  socket.emit('player_continue');
                })

                //add event listener to listen for when the camera x rotation has been changes
                document.querySelector("#camera").addEventListener('xRotation', function(e) {
                  socket.emit('x_rotation_update', {planeXRotation: e.detail.planeXRotation,
                                                    planeYPosFactor: e.detail.planeYPosFactor
                              });   
                })

                //add event listener to listen for right control
                document.querySelector("#right").addEventListener('mousedown', function() {
                  socket.emit('move_right');
                  Context_AF.particlesLeftSide.setAttribute('particle-system', {enabled: true});
                })

                //add event listener to listen for stopping right control
                document.querySelector("#right").addEventListener('mouseup', function() {
                  console.log("stop ht wbhdhjdhsgdvs")
                  socket.emit('stop_horizontal_movement');
                  Context_AF.particlesLeftSide.setAttribute('particle-system', {enabled: false});
                })

                //add event listener to listen for right control
                document.querySelector("#left").addEventListener('mousedown', function() {
                  socket.emit('move_left');
                  
                  Context_AF.particlesRightSide.setAttribute('particle-system', {enabled: true});
                })

                //add event listener to listen for stopping right control
                document.querySelector("#left").addEventListener('mouseup', function() {
                  socket.emit('stop_horizontal_movement');
                  Context_AF.particlesRightSide.setAttribute('particle-system', {enabled: false});
                })

                //add event listener for score update
                document.querySelector('#plane').addEventListener('scoreUpdate', function() {
                  Context_AF.score += 1;
                  Context_AF.scorePlaceholder.innerText = Context_AF.score;
                  socket.emit('score', {score: Context_AF.score});
                })
            });

            // get global starter data
            socket.on('starter_data', (data) => {
              //if there is only one other player and they are on a different device then then send player data to server
              console.log("data len: ", data.players.length)
              if(data.players.length === 1)
              {
                //if an existing player is already using the same device then the current player must join on a different device
                if(data.players[0].device === Context_AF.device){
                  const unusedDevice = Context_AF.device === DEVICES.mobile ? DEVICES.desktop : DEVICES.mobile;
                  Context_AF.devicePlaceholder.innerText = Context_AF.device;
                  Context_AF.otherDevicePlaceholder.innerText = unusedDevice
                  displayUI([Context_AF.incorrectDeviceUI]);
                }
                //if the players are on different devices then the game can begin
                else{
                  console.log("it's diff");
                  Context_AF.playerId = data.socketId;
                  socket.emit('player_ready', {device: Context_AF.device})

                  //desktop camera pos
                  document.querySelector("#camera").object3D.position.set(DESKTOP_CAMERA.x, DESKTOP_CAMERA.y, DESKTOP_CAMERA.z);
                  document.querySelector("#camera").object3D.rotation.x = THREE.MathUtils.degToRad(DESKTOP_CAMERA.xRotation);
                  document.querySelector("#plane").object3D.position.set(0, 0.6, -1.9);
                }
              }
              else if(data.players.length === 0){
                console.log("it's diff 2")
                Context_AF.playerId = data.socketId;
                Context_AF.isLeadPlayer = true;
                socket.emit('player_ready', {device: Context_AF.device})

                //mobile camera pos
                document.querySelector("#plane").object3D.parent = document.querySelector("#camera").object3D;
                document.querySelector("#plane").object3D.position.set(0, -1, -1.9)

                displayUI([Context_AF.waitingUI]);
              }
              //if two players are already playing the game
              else {
                displayUI([Context_AF.lobbyUI]);
              }
              console.log("my device:", Context_AF.device)
            });

            //if the other player leaves the game, then put the current player into a waiting state
            socket.on('waiting', (data) => {
              console.log("Plyaer id: ", Context_AF.playerId, " lead player id: ", data)
              Context_AF.isLeadPlayer = data === Context_AF.playerId;
              Context_AF.mode = "";
              console.log(Context_AF.playerId === data ? "I am the lead player" : "I am not the lead player")
              //hide the currently displayed UI and display the waiting UI

              document.querySelector("#camera").removeAttribute('modified-look-controls');
              document.querySelector("#camera").removeAttribute('hi');

              document.querySelector('#game').removeAttribute('cloud-generator')

              Context_AF.particlesRightSide.setAttribute('particle-system', {enabled: false});
              Context_AF.particlesLeftSide.setAttribute('particle-system', {enabled: false});


              document.querySelector("#camera").object3D.position.set(0, 1.6, 0);
              document.querySelector("#camera").object3D.rotation.x = THREE.MathUtils.degToRad(0);
              document.querySelector("#plane").object3D.parent = document.querySelector("#camera").object3D;
              document.querySelector("#plane").object3D.position.set(0, -1, -1.9)


              displayUI([Context_AF.waitingUI]);
            })

            //listen for when both players are ready to begin mode selection
            socket.on('mode_selection', (data) => {
              console.log("Plyaer id: ", Context_AF.playerId, " lead player id: ", data)
              console.log(Context_AF.playerId === data ? "I am selecting the mode" : "I am waiting for the mode to be selected")
              //hide the currently displayed UI and display the mode selection UI
              const uiToDisplay = [Context_AF.modeSelectionUI];
              Context_AF.modeSelectionTitle.innerText = "Mode Selection"
              if(Context_AF.isLeadPlayer)
                uiToDisplay.push(Context_AF.modeSelectionButtons);
              else
                uiToDisplay.push(Context_AF.modeSelectionWaitingUI);
              displayUI(uiToDisplay);
             
            })

            //listens for when the instructions are ready to be displayed
            socket.on('instructions', (data) => {
              Context_AF.mode = data.mode;
              console.log("instructions for mode are being displayed: ", data);
              const uiToDisplay = [Context_AF.instructionsUI];
              uiToDisplay.push(Context_AF.continueButton);
              Context_AF.selectedModePlaceholder.innerText = data.mode;
              if(Context_AF.device === DEVICES.desktop){
                console.log("i got desktop", Context_AF.mode)
                uiToDisplay.push(Context_AF.desktopPlayerInstructionsUI);
                if(Context_AF.mode === "collaborative")
                  uiToDisplay.push(Context_AF.collabDesktopPlayerInstructionsUI);
              }
              else if (Context_AF.device === DEVICES.mobile) {
                console.log("i got mobile")
                uiToDisplay.push(Context_AF.mobilePlayerInstructionsUI);
                if(Context_AF.mode === "collaborative")
                  uiToDisplay.push(Context_AF.collabMobilePlayerInstructionsUI);
              }
              //hide the currently displayed UI and display the instructions UI
              displayUI(uiToDisplay);
            })

            //listens for when the game is ready to begin
            socket.on('playing', (data) => {
              console.log("playing in mode: ", data.mode, " time left: ", data.timeLeft);
              //hide the currently displayed UI and display the playing UI
              
              Context_AF.timerPlaceholder.innerText = data.timeLeft;
              Context_AF.scorePlaceholder.innerText = Context_AF.score;
              Context_AF.opponentScorePlaceholder.innerText = Context_AF.opponentScore;
              document.querySelector('#game').setAttribute('cloud-generator', {})
              const uiToDisplay = [Context_AF.playingUI];
              if(data.mode === 'competitive'){
                document.querySelector("#plane").setAttribute('plane-collider', {});
                document.querySelector("#plane").setAttribute('obb-collider', {});
                uiToDisplay.push(Context_AF.opponentScoreUI)
              }
              else if (data.mode === "collaborative" && Context_AF.isLeadPlayer) {
                console.log("assigning plane collider to lead player")
                document.querySelector("#plane").setAttribute('plane-collider', {});
                document.querySelector("#plane").setAttribute('obb-collider', {});
              }

              //add ghost component plane for competitive mode
              if(data.mode === "competitive"){
                const planeEl = document.createElement("a-entity");
                planeEl.id = "opponentPlane";
                planeEl.object3D.position.set(0, 0.6, -3)
                planeEl.object3D.rotation.x = THREE.MathUtils.degToRad(-20);
                planeEl.object3D.rotation.y = THREE.MathUtils.degToRad(-180);
                planeEl.object3D.scale.set(0.1, 0.1, 0.1);
                planeEl.setAttribute('gltf-model', '#paper_plane');
                planeEl.setAttribute('plane-movement', {});
        
                // planeEl.setAttribute('ring-plane', {});
                // planeEl.setAttribute('obb-collider', {});
                // planeEl.object3D.position.set(Math.floor(Math.random() * 10 - 5), 0, -50)
                Context_AF.scene.appendChild(planeEl);
              }

              if(Context_AF.isLeadPlayer) {
                document.querySelector("#camera").setAttribute('modified-look-controls', {});
                document.querySelector("#camera").setAttribute('hi', {});
              }
              else {
                document.querySelector("#plane").setAttribute('plane-movement', {});
                uiToDisplay.push(Context_AF.horizontalControlsUI);
              }

              displayUI(uiToDisplay);

              // if(data.mode === "competitive") {
              //   //create an instance of a ghost plane
              // }

              // //if this is a mobile device, then access the plane mobile component and enable it
              // if(Context_AF.device === DEVICES.mobile){

              // }

              // //if the player is on a desktop device, then access the desktop plane mobile component and enable it
              // if(Context_AF.device === DEVICES.desktop){

              // }
            })

            //listens for when to generate an obstacle
            socket.on('generate_obstacle', (data) => {
              const obstacleEl = document.createElement("a-ring");
              obstacleEl.setAttribute('ring-obstacle', {});
              obstacleEl.setAttribute('obb-collider', {});
              obstacleEl.className = 'collider'

              //display ghost and current player obstacles if this is competitive mode
              if(Context_AF.mode === "competitive") {
                const ghostObstacleEl = document.createElement("a-ring");
                ghostObstacleEl.setAttribute('ring-obstacle', {});
                ghostObstacleEl.setAttribute('obb-collider', {});
                ghostObstacleEl.setAttribute('material', {color: '#000000'});
                ghostObstacleEl.className = 'ghostCollider'
                if(Context_AF.isLeadPlayer){
                  obstacleEl.object3D.position.set(data.leadPlayerObstacles.x, data.leadPlayerObstacles.y, data.leadPlayerObstacles.z);
                  ghostObstacleEl.object3D.position.set(data.nonLeadPlayerObstacles.x, data.nonLeadPlayerObstacles.y, data.nonLeadPlayerObstacles.z);
                }
                else {
                  obstacleEl.object3D.position.set(data.nonLeadPlayerObstacles.x, data.nonLeadPlayerObstacles.y, data.nonLeadPlayerObstacles.z);
                  ghostObstacleEl.object3D.position.set(data.leadPlayerObstacles.x, data.leadPlayerObstacles.y, data.leadPlayerObstacles.z);
                }
                Context_AF.scene.appendChild(ghostObstacleEl);
              }
              else {
                obstacleEl.object3D.position.set(data.x, data.y, data.z);
              }
              
              
              Context_AF.scene.appendChild(obstacleEl);
            })

            //listens for the changes in the plane position
            socket.on('plane_update', (data) => {
              if(data.mode === "collaborative") {
                console.log("looks like i got an update collab")
                planeYPosUpdate('#plane', data.planeYPosFactor, data.planeXRotation)
              }
              else {
                planeYPosUpdate('#opponentPlane', data.planeYPosFactor, data.planeXRotation)
              }
              
              //document.querySelector("#camera").object3D.position.y = data.planeYPos;

              // if(data.mode === "competitive"){
              //   //update the enemy player horizontal position if 
              //   if(Context_AF.device === DEVICES.mobile){

              //   }
              // }
            })

            socket.on('move_towards_point', (data) => {
              
              // const duration = Math.abs(data.destPoint - currPosX) * data.timeUnit;
              // // document.querySelector("#camera").setAttribute("animation", {dur: duration,
              //                                                             to: data.destPoint,
              //                                                             from: currPosX,  
              //                                                             enabled: true 
              // });
              Context_AF.horizontalMovement = true;

              let objectName = "#plane";
              if(Context_AF.isLeadPlayer){
                objectName = data.mode === "competitive" ? '#opponentPlane' : '#camera';
                console.log("obj name", objectName)
              }
                
              const moveX = setInterval(function() {
                
                console.log("My obj", objectName)
                const currPosX = document.querySelector(objectName).object3D.position.x;
                console.log("hor mov: ", Context_AF.horizontalMovement);
                if(currPosX <= 8 && currPosX >= -8)
                  if(data.dir === "left")
                    document.querySelector(objectName).object3D.position.x -= 0.05;
                  else if(data.dir === "right")
                    document.querySelector(objectName).object3D.position.x += 0.05;
                if(currPosX > 8 || currPosX < -8 || !Context_AF.horizontalMovement) {
                  clearInterval(moveX);  
                  if(data.dir === "left")
                    document.querySelector(objectName).object3D.position.x += 0.05;
                  else if(data.dir === "right")
                    document.querySelector(objectName).object3D.position.x -= 0.05;
                }
                  
            }, 16.7)
            })

            socket.on('stop_horizontal', (data) => {
              //console.log("we stopped")
              Context_AF.horizontalMovement = false;
            })

            //listens for when the score has been updated
            socket.on('score_update', (data) => {
              

              if(data.gameMode === 'competitive'){
                Context_AF.opponentScore = data.score;
                console.log("comp score: ", Context_AF.opponentScore);
                Context_AF.opponentScorePlaceholder.innerText = Context_AF.opponentScore;
              }
              else {
                Context_AF.score = data.score;
                console.log("collab score: ", Context_AF.score);
              }
              Context_AF.scorePlaceholder.innerText = Context_AF.score;
              //console.log("score: ", data);
            })
            
            //listens for when the game timer has been updated
            socket.on('time_update', (data) => {
              console.log("time: ", data.timeLeft)
              Context_AF.timerPlaceholder.innerText = data.timeLeft;
            })

            //listens for when the game has ended
            socket.on('game_end', (data) => {
              const uiToDisplay = [Context_AF.modeSelectionUI];
              Context_AF.modeSelectionTitle.innerText = 'Game Over!';
              Context_AF.scoreGameOverUI.innerText = Context_AF.score;
              Context_AF.opponentScoreGameOverUI.innerText = Context_AF.opponentScore;
              uiToDisplay.push(Context_AF.gameOverUI);
              if(Context_AF.isLeadPlayer)
                uiToDisplay.push(Context_AF.modeSelectionButtons);
              else
                uiToDisplay.push(Context_AF.modeSelectionWaitingUI);
              displayUI(uiToDisplay);
              //console.log("game has ended");
              //console.log("Plyaer id: ", Context_AF.playerId, " lead player id: ", data)
              //console.log(Context_AF.playerId === data ? "I am selecting the mode" : "I am waiting for the mode to be selected")
              document.querySelector("#plane").removeAttribute('plane-collider');
              document.querySelector("#plane").removeAttribute('plane-movement');
              document.querySelector("#plane").removeAttribute('plane-movement');
              
             document.querySelector('#game').removeAttribute('cloud-generator')

              document.querySelector("#plane").removeAttribute('obb-collider');
              document.querySelector("#camera").removeAttribute('modified-look-controls');
              document.querySelector("#camera").removeAttribute('hi');

              if(Context_AF.mode === "competitive")
                document.querySelector("#opponentPlane").removeAttribute('plane-movement');

              //reset game logic
              Context_AF.score = 0
              Context_AF.opponentScore = 0
              if(!Context_AF.isLeadPlayer)
                document.querySelector('#plane').object3D.position.set(0, 0.6, -3);
              document.querySelector('#camera').object3D.position.set(0, 1.6, 0);

              Context_AF.particlesRightSide.setAttribute('particle-system', {enabled: false});
              Context_AF.particlesLeftSide.setAttribute('particle-system', {enabled: false});
              
              
              console.log("total score ", Context_AF.score);

              

              //hide the currently displayed UI and display the mode selection UI
              displayUI(uiToDisplay);
            })

          //listens if the player is waiting for another player

          //listens if the player cna 
    }
});

function displayUI(uiToDisplay) {
  //hide the currently displayed UI
  const activeUI = document.querySelectorAll('.activeUI');
  console.log("active UI", activeUI)
  for (uiElement of activeUI) {
    uiElement.style.display = HIDE_UI;
    uiElement.classList.remove('activeUI');
  }
  //display the requested UI
  console.log("ui to display", uiToDisplay)
  for (uiElement of uiToDisplay) {
    uiElement.style.display = SHOW_UI;
    uiElement.classList.add('activeUI')
  }
}

const desktopScene = function() {

}

const mobileScene = function() {

}

function planeYPosUpdate (planeID, positionFactor, xRotation) {
  console.log("looks like i got a collab yPos update")
  console.log("element name: ", planeID, document.querySelector(planeID))
  document.querySelector(planeID).setAttribute('plane-movement', {yPosFactor: positionFactor,
                                                                  xRotation: (xRotation)*(-1)
  })
}
