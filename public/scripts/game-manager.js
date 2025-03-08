
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
      // Context_AF.particlesRightSide = document.querySelector("#particlesRightSide");
      // Context_AF.particlesLeftSide = document.querySelector("#particlesLeftSide");

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
      Context_AF.scoreGameOverPlaceholder = document.querySelector('#scoreGameOver');
      Context_AF.opponentScoreGameOverUI = document.querySelector('#opponentScoreGameOverUI');
      Context_AF.opponentScoreGameOverPlaceHolder = document.querySelector('#opponentScoreGameOver');

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
                  // Context_AF.particlesLeftSide.setAttribute('particle-system', {enabled: true});
                })

                //add event listener to listen for stopping right control
                document.querySelector("#right").addEventListener('mouseup', function() {
                  socket.emit('stop_horizontal_movement');
                  // Context_AF.particlesLeftSide.setAttribute('particle-system', {enabled: false});
                })

                //add event listener to listen for stopping right control
                document.querySelector("#right").addEventListener('mouseleave', function() {
                  socket.emit('stop_horizontal_movement');
                  // Context_AF.particlesLeftSide.setAttribute('particle-system', {enabled: false});
                })

                //add event listener to listen for right control
                document.querySelector("#left").addEventListener('mousedown', function() {
                  socket.emit('move_left');
                  
                  // Context_AF.particlesRightSide.setAttribute('particle-system', {enabled: true});
                })

                //add event listener to listen for stopping right control
                document.querySelector("#left").addEventListener('mouseup', function() {
                  socket.emit('stop_horizontal_movement');
                  // Context_AF.particlesRightSide.setAttribute('particle-system', {enabled: false});
                })

                //add event listener to listen for stopping right control
                document.querySelector("#left").addEventListener('mouseleave', function() {
                  socket.emit('stop_horizontal_movement');
                  // Context_AF.particlesRightSide.setAttribute('particle-system', {enabled: false});
                })

                //add event listener for score update
                document.querySelector('#plane').addEventListener('scoreUpdate', function() {
                  Context_AF.score += 1;
                  console.log("score collision")
                  //stop sound
                  const ambientSound = document.querySelector('[sound__chime]');
                  ambientSound.components.sound__chime.playSound();
                  Context_AF.scorePlaceholder.innerText = Context_AF.score;
                  socket.emit('score', {score: Context_AF.score});
                })
            });

            // get global starter data
            socket.on('starter_data', (data) => {
              //if there is only one other player and they are on a different device then then send player data to server
              if(data.players.length === 1)
              {
                //if an existing player is already using the same device then the current player must join on a different device
                if(data.players[0].device === Context_AF.device){
                  const unusedDevice = Context_AF.device === DEVICES.mobile ? DEVICES.desktop : DEVICES.mobile;
                  Context_AF.devicePlaceholder.innerText = unusedDevice;
                  Context_AF.otherDevicePlaceholder.innerText = Context_AF.device;
                  displayUI([Context_AF.incorrectDeviceUI]);
                }
                //if the players are on different devices then the game can begin
                else{
                  Context_AF.playerId = data.socketId;
                  socket.emit('player_ready', {device: Context_AF.device})
                }
              }
              else if(data.players.length === 0){
                Context_AF.playerId = data.socketId;
                Context_AF.isLeadPlayer = true;
                socket.emit('player_ready', {device: Context_AF.device});

                displayUI([Context_AF.waitingUI]);
              }
              //if two players are already playing the game
              else {
                displayUI([Context_AF.lobbyUI]);
              }

              if(Context_AF.device === DEVICES.mobile) {
                //mobile camera pos
                document.querySelector("#plane").object3D.parent = document.querySelector("#camera").object3D;
                document.querySelector("#plane").object3D.position.set(0, -1, -1.9)
              }
              else {
                //desktop
                document.querySelector("#camera").object3D.position.set(DESKTOP_CAMERA.x, DESKTOP_CAMERA.y, DESKTOP_CAMERA.z);
                document.querySelector("#camera").object3D.rotation.x = THREE.MathUtils.degToRad(DESKTOP_CAMERA.xRotation);
                document.querySelector("#plane").object3D.position.set(0, 0.6, -1.9);
              }
            
            });

            //if the other player leaves the game, then put the current player into a waiting state
            socket.on('waiting', (data) => {
              Context_AF.isLeadPlayer = data === Context_AF.playerId;
              Context_AF.mode = "";

              //stop sound
              const ambientSound = document.querySelector('[sound__ambient]');
              ambientSound.components.sound__ambient.stopSound();

              document.querySelector("#camera").removeAttribute('modified-look-controls');
              document.querySelector("#camera").removeAttribute('hi');

              document.querySelector('#game').removeAttribute('cloud-generator')

              // Context_AF.particlesRightSide.setAttribute('particle-system', {enabled: false});
              // Context_AF.particlesLeftSide.setAttribute('particle-system', {enabled: false});


              if(Context_AF.device === DEVICES.mobile) {
                //mobile camera pos
                document.querySelector("#plane").object3D.parent = document.querySelector("#camera").object3D;
                document.querySelector("#plane").object3D.position.set(0, -1, -1.9)
              }
              else {
                //desktop camera pos
                document.querySelector("#camera").object3D.position.set(DESKTOP_CAMERA.x, DESKTOP_CAMERA.y, DESKTOP_CAMERA.z);
                document.querySelector("#camera").object3D.rotation.x = THREE.MathUtils.degToRad(DESKTOP_CAMERA.xRotation);
                document.querySelector("#plane").object3D.position.set(0, 0.6, -1.9);
              }

              displayUI([Context_AF.waitingUI]);
            })

            //listen for when both players are ready to begin mode selection
            socket.on('mode_selection', (data) => {
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
              const uiToDisplay = [Context_AF.instructionsUI];
              uiToDisplay.push(Context_AF.continueButton);
              Context_AF.selectedModePlaceholder.innerText = data.mode;
              if(Context_AF.device === DEVICES.desktop){
                uiToDisplay.push(Context_AF.desktopPlayerInstructionsUI);
                if(Context_AF.mode === "collaborative")
                  uiToDisplay.push(Context_AF.collabDesktopPlayerInstructionsUI);
              }
              else if (Context_AF.device === DEVICES.mobile) {
                uiToDisplay.push(Context_AF.mobilePlayerInstructionsUI);
                if(Context_AF.mode === "collaborative")
                  uiToDisplay.push(Context_AF.collabMobilePlayerInstructionsUI);
              }
              
              //hide the currently displayed UI and display the instructions UI
              displayUI(uiToDisplay);
            })

            //listens for when the game is ready to begin
            socket.on('playing', (data) => {
              //hide the currently displayed UI and display the playing UI

              //turn on ambient sound
              const ambientSound = document.querySelector('[sound__ambient]');
              ambientSound.components.sound__ambient.playSound();
              
              Context_AF.timerPlaceholder.innerText = data.timeLeft;
              Context_AF.scorePlaceholder.innerText = Context_AF.score;
              Context_AF.opponentScorePlaceholder.innerText = Context_AF.opponentScore;
              document.querySelector('#game').setAttribute('cloud-generator', {})
              const uiToDisplay = [Context_AF.playingUI];
              if(data.mode === 'competitive'){
                //document.querySelector("#plane").setAttribute('plane-collider', {});
                document.querySelector("#plane").setAttribute('obb-collider', {});
                uiToDisplay.push(Context_AF.opponentScoreUI)
              }
              else if (data.mode === "collaborative" && Context_AF.isLeadPlayer) {
                //document.querySelector("#plane").setAttribute('plane-collider', {});
                document.querySelector("#plane").setAttribute('obb-collider', {});
              }

              //add ghost component plane for competitive mode
              if(data.mode === "competitive"){
                const planeEl = document.createElement("a-entity");
                planeEl.id = "opponentPlane";
                planeEl.object3D.position.set(0, 0.6, -1.9)
                planeEl.setAttribute('gltf-model', '#paper_plane_ghost');
                planeEl.setAttribute('plane-movement', {});
        
                Context_AF.scene.appendChild(planeEl);
              }

              if(Context_AF.device === DEVICES.mobile) {
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
              console.log("i am genera")
              const obstacleEl = document.createElement("a-entity");
              obstacleEl.setAttribute('geometry', {primitive: 'torus',
                                                    radius: 1.3,
                                                    radiusTubular: 0.04
                                      });
              obstacleEl.setAttribute('material', {color: '#27E5F0'});
              obstacleEl.setAttribute('ring-obstacle', {});
              
              obstacleEl.setAttribute('obb-collider', {size:1.8});
              obstacleEl.className = 'regularObstacle obstacle'

              //display ghost and current player obstacles if this is competitive mode
              if(Context_AF.mode === "competitive") {
                const ghostObstacleEl = document.createElement("a-entity");
                ghostObstacleEl.setAttribute('geometry', {primitive: 'torus',
                                                          radius: 1.3,
                                                          radiusTubular: 0.04
                                            });
                ghostObstacleEl.setAttribute('obb-collider', {size:1.8});
                ghostObstacleEl.setAttribute('material', {transparent: true,
                                                          opacity: 0.15
                                            });
                ghostObstacleEl.setAttribute('ring-obstacle', {});
                ghostObstacleEl.className = 'ghostCollider obstacle'
                if(Context_AF.device === DEVICES.mobile) {
                  obstacleEl.object3D.position.set(data.mobileObstacles.x, data.mobileObstacles.y, data.mobileObstacles.z);
                  ghostObstacleEl.object3D.position.set(data.desktopObstacles.x, data.desktopObstacles.y, data.desktopObstacles.z);
                }
                else {
                  obstacleEl.object3D.position.set(data.desktopObstacles.x, data.desktopObstacles.y, data.desktopObstacles.z);
                  ghostObstacleEl.object3D.position.set(data.mobileObstacles.x, data.mobileObstacles.y, data.mobileObstacles.z);
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
              Context_AF.horizontalMovement = true;

              let objectName = "#plane";
              if(Context_AF.device === DEVICES.mobile){
                objectName = Context_AF.mode === "competitive" ? '#opponentPlane' : '#camera';
              }

              if(data.dir === "left")
                document.querySelector(objectName).setAttribute('horizontal-movement', {enabled: true, xFactor: -1})
              else if(data.dir === "right")
                document.querySelector(objectName).setAttribute('horizontal-movement', {enabled: true, xFactor: 1})
                
            //   const moveX = setInterval(function() {
            //     const currPosX = document.querySelector(objectName).object3D.position.x;
            //     if(currPosX <= 5 && currPosX >= -5)
            //       if(data.dir === "left")
            //         document.querySelector(objectName).object3D.position.x -= 0.05;
            //       else if(data.dir === "right")
            //         document.querySelector(objectName).object3D.position.x += 0.05;
            //     if(currPosX > 5 || currPosX < -5 || !Context_AF.horizontalMovement) {
            //       clearInterval(moveX);  
            //       if(data.dir === "left")
            //         document.querySelector(objectName).object3D.position.x += 0.05;
            //       else if(data.dir === "right")
            //         document.querySelector(objectName).object3D.position.x -= 0.05;
            //     }
                  
            // }, 16.7)
            })

            socket.on('stop_horizontal', (data) => {
              Context_AF.horizontalMovement = false;
              let objectName = "#plane";
              if(Context_AF.device === DEVICES.mobile){
                objectName = Context_AF.mode === "competitive" ? '#opponentPlane' : '#camera';
              }
              document.querySelector(objectName).setAttribute('horizontal-movement', {enabled: false})
            })

            
            //listens for when the score has been updated
            socket.on('score_update', (data) => {
              
              console.log("score reciebed", data)
              if(data.gameMode === 'competitive'){
                Context_AF.opponentScore = data.score;
                Context_AF.opponentScorePlaceholder.innerText = Context_AF.opponentScore;
              }
              else {
                const ambientSound = document.querySelector('[sound__chime]');
                  ambientSound.components.sound__chime.playSound();
                Context_AF.score = data.score;
              }
              Context_AF.scorePlaceholder.innerText = Context_AF.score;
            })
            
            //listens for when the game timer has been updated
            socket.on('time_update', (data) => {
              Context_AF.timerPlaceholder.innerText = data.timeLeft;
            })

            //listens for when the game has ended
            socket.on('game_end', (data) => {

              //stop sound
              const ambientSound = document.querySelector('[sound__ambient]');
              ambientSound.components.sound__ambient.stopSound();

              const uiToDisplay = [Context_AF.modeSelectionUI];
              Context_AF.modeSelectionTitle.innerText = 'Game Over!';
              Context_AF.scoreGameOverPlaceholder.innerText = Context_AF.score;
              if(Context_AF.mode === 'competitive'){
                uiToDisplay.push(Context_AF.opponentScoreGameOverUI);
                Context_AF.opponentScoreGameOverPlaceHolder.innerText = Context_AF.opponentScore;
              }
              uiToDisplay.push(Context_AF.gameOverUI);
              if(Context_AF.isLeadPlayer)
                uiToDisplay.push(Context_AF.modeSelectionButtons);
              else
                uiToDisplay.push(Context_AF.modeSelectionWaitingUI);
              displayUI(uiToDisplay);
              // document.querySelector("#plane").removeAttribute('plane-collider');
              document.querySelector("#plane").removeAttribute('plane-movement');
              document.querySelector("#plane").removeAttribute('plane-movement');
              
             document.querySelector('#game').removeAttribute('cloud-generator')

              document.querySelector("#plane").removeAttribute('obb-collider');
              document.querySelector("#camera").removeAttribute('modified-look-controls');
              document.querySelector("#camera").removeAttribute('hi');

              if(Context_AF.mode === "competitive")
                document.querySelector("#opponentPlane").parentNode.removeChild(document.querySelector("#opponentPlane"));

              //reset game logic
              Context_AF.score = 0
              Context_AF.opponentScore = 0
              if(Context_AF.device === DEVICES.desktop)
                document.querySelector('#plane').object3D.position.set(0, 0.6, -1.9);
              else {
                document.querySelector('#camera').object3D.position.set(0, 1.6, 0);
              }

              //delete all obstacles rings
              const colliders = document.querySelectorAll('.obstacle');
              console.log(colliders)
              for (let i=0; i<colliders.length; i++)
                colliders[i].parentNode.removeChild(colliders[i]);

              // Context_AF.particlesRightSide.setAttribute('particle-system', {enabled: false});
              // Context_AF.particlesLeftSide.setAttribute('particle-system', {enabled: false});
              

              

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
  for (uiElement of activeUI) {
    uiElement.style.display = HIDE_UI;
    uiElement.classList.remove('activeUI');
  }
  //display the requested UI
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
  document.querySelector(planeID).setAttribute('plane-movement', {yPosFactor: positionFactor,
                                                                  xRotation: (xRotation)*(-1)
  })
}
