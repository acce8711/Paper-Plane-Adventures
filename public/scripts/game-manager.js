
//component manages the game state
AFRAME.registerComponent('game-manager', {
  init: function () {
      const Context_AF = this;

      //game logic variables
      Context_AF.device = AFRAME.utils.device.isMobile() ? DEVICES.mobile : DEVICES.desktop;
      Context_AF.playerId = "";
      Context_AF.isLeadPlayer = false;
      Context_AF.mode = MODES.noMode;
      Context_AF.score = 0;
      Context_AF.opponentScore = 0;

      //UI variables
      Context_AF.scene = document.querySelector('a-scene');
      Context_AF.camera = document.querySelector('#camera');
      Context_AF.plane = document.querySelector('#plane');
      Context_AF.cloudGenerator = document.querySelector('#cloudGenerator');
      
      //2D UI elements 
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
      Context_AF.rightButton = document.querySelector('#right');
      Context_AF.leftButton = document.querySelector('#left');

      Context_AF.gameOverUI = document.querySelector('#gameOverUI');
      Context_AF.scoreGameOverPlaceholder = document.querySelector('#scoreGameOver');
      Context_AF.opponentScoreGameOverUI = document.querySelector('#opponentScoreGameOverUI');
      Context_AF.opponentScoreGameOverPlaceHolder = document.querySelector('#opponentScoreGameOver');

      const socket = io();

      socket.on(WEBSOCKET_ON_EVENTS.connect, () => {
          //event listener listens for when the competitive mode has been selected by the lead player
          Context_AF.competitiveModeButton.addEventListener('click', function(){
              Context_AF.mode = MODES.competitive;
              socket.emit(WEBSOCKET_EMIT_EVENTS .modeSelected, MODES.competitive);
          });

          ///event listener listens for when the collaborative mode has been selected by the lead player
          Context_AF.collaborativeModeButton.addEventListener('click', function(){
            Context_AF.mode = MODES.collaborative;
            socket.emit(WEBSOCKET_EMIT_EVENTS .modeSelected, MODES.collaborative);
          });

          //event listener listens for when a player is ready to continue playing
          Context_AF.continueButton.addEventListener('click', function(){
            //switch out button with text
            Context_AF.continueButton.style.display = HIDE_UI;
            Context_AF.continueButton.classList.remove(ACTIVE_UI);
            Context_AF.continueWaitingUI.style.display = SHOW_UI;
            Context_AF.continueWaitingUI.classList.add(ACTIVE_UI);
            socket.emit(WEBSOCKET_EMIT_EVENTS .playerContinue);
          })

          //event listener listens when the camera by the mobile player has been rotated
          Context_AF.camera.addEventListener('xRotation', function(e) {
            socket.emit(WEBSOCKET_EMIT_EVENTS.verticalPosUpdate, {planeXRotation: e.detail.planeXRotation,
                                                            planeYPosFactor: e.detail.planeYPosFactor});   
          })

          //event listener listens for when the right wind button has been pressed
          Context_AF.rightButton.addEventListener('mousedown', function() {
            socket.emit(WEBSOCKET_EMIT_EVENTS.moveRight);
          })

          //event listener listens for when the right wind button is released
          Context_AF.rightButton.addEventListener('mouseup', function() {
            socket.emit(WEBSOCKET_EMIT_EVENTS.stopHorizontalMovement);
          })

          //event listener listens for when the right wind button is no longer hovered over
          Context_AF.rightButton.addEventListener('mouseleave', function() {
            socket.emit(WEBSOCKET_EMIT_EVENTS.stopHorizontalMovement);
          })

          //event listener listens for when the left wind button has been pressed
          Context_AF.leftButton.addEventListener('mousedown', function() {
            socket.emit(WEBSOCKET_EMIT_EVENTS.moveLeft);
          })

          //event listener listens for when the left wind button is released
          Context_AF.leftButton.addEventListener('mouseup', function() {
            socket.emit(WEBSOCKET_EMIT_EVENTS.stopHorizontalMovement);
          })

          //event listener listens for when the left wind button is no longer hovered over
          Context_AF.leftButton.addEventListener('mouseleave', function() {
            socket.emit(WEBSOCKET_EMIT_EVENTS .stopHorizontalMovement);
          })

          //event listener for when a plane collides with an obstacle
          Context_AF.plane.addEventListener('scoreUpdate', function() {
            //update player score
            Context_AF.score += 1;
            Context_AF.scorePlaceholder.innerText = Context_AF.score;
            
            //stop sound
            const ambientSound = document.querySelector('[sound__chime]');
            ambientSound.components.sound__chime.playSound();
            
            socket.emit(WEBSOCKET_EMIT_EVENTS .score, {score: Context_AF.score});
          })
      });

      // get global starter data
      socket.on(WEBSOCKET_ON_EVENTS.starterData, (data) => {
        //send the first player data to the server and change UI
        if (data.players.length === 0){
          Context_AF.playerId = data.socketId;
          Context_AF.isLeadPlayer = true;
          socket.emit(WEBSOCKET_EMIT_EVENTS.playerReady, {device: Context_AF.device});
          displayUI([Context_AF.waitingUI]);
          resetPositions(Context_AF.device, Context_AF.plane, Context_AF.camera);
        }
        //if one other player is currently in the game
        else if(data.players.length === 1){
          //if an existing player is already using the same device then the current player must join on a different device
          if(data.players[0].device === Context_AF.device){
            const unusedDevice = Context_AF.device === DEVICES.mobile ? DEVICES.desktop : DEVICES.mobile;
            Context_AF.devicePlaceholder.innerText = unusedDevice;
            Context_AF.otherDevicePlaceholder.innerText = Context_AF.device;
            displayUI([Context_AF.incorrectDeviceUI]);
          }
          //if the players are on different devices then the game can begin
          else {
            Context_AF.playerId = data.socketId;
            socket.emit(WEBSOCKET_EMIT_EVENTS.playerReady, {device: Context_AF.device})
            resetPositions(Context_AF.device, Context_AF.plane, Context_AF.camera);
          }
        }
        //if two other players are already playing the game, display the lobby UI
        else {
          displayUI([Context_AF.lobbyUI]);
        }
      });

      //if the other player leaves the game, then put the current player into a waiting state
      socket.on(WEBSOCKET_ON_EVENTS.waiting, (data) => {
        displayUI([Context_AF.waitingUI]);

        //reset game play 
        removeElements(Context_AF.plane, Context_AF.camera, Context_AF.cloudGenerator, Context_AF.mode)

        //reset element positions
        resetPositions(Context_AF.device, Context_AF.plane, Context_AF.camera)

        //reset game logic varaibles
        Context_AF.isLeadPlayer = data.leadPlayerID === Context_AF.playerId;
        Context_AF.score = 0
        Context_AF.opponentScore = 0
        Context_AF.mode = MODES.noMode;
      })

      //listen for when both players are in the game and are ready to select the mode
      socket.on(WEBSOCKET_ON_EVENTS.modeSelection, () => {
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
      socket.on(WEBSOCKET_ON_EVENTS.instructions, (data) => {
        Context_AF.mode = data.mode;

        //display instructions UI
        const uiToDisplay = [Context_AF.instructionsUI];
        uiToDisplay.push(Context_AF.continueButton);
        Context_AF.selectedModePlaceholder.innerText = data.mode;

        if(Context_AF.device === DEVICES.desktop){
          uiToDisplay.push(Context_AF.desktopPlayerInstructionsUI);
          if(Context_AF.mode === MODES.collaborative)
            uiToDisplay.push(Context_AF.collabDesktopPlayerInstructionsUI);
        }
        else if (Context_AF.device === DEVICES.mobile) {
          uiToDisplay.push(Context_AF.mobilePlayerInstructionsUI);
          if(Context_AF.mode === MODES.collaborative)
            uiToDisplay.push(Context_AF.collabMobilePlayerInstructionsUI);
        }

        displayUI(uiToDisplay);
      })

      //listens for when the game is ready to begin
      socket.on(WEBSOCKET_ON_EVENTS.playing, (data) => {
        //turn on ambient sound
        const ambientSound = document.querySelector('[sound__ambient]');
        ambientSound.components.sound__ambient.playSound();

        //start cloud generator
        Context_AF.cloudGenerator.setAttribute('cloud-generator', {})
        
        //UI updates
        Context_AF.timerPlaceholder.innerText = data.timeLeft;
        Context_AF.scorePlaceholder.innerText = Context_AF.score;
        Context_AF.opponentScorePlaceholder.innerText = Context_AF.opponentScore;

        const uiToDisplay = [Context_AF.playingUI];

        //update UI and create components based on mode type
        if(Context_AF.mode === MODES.competitive){
          Context_AF.plane.setAttribute('obb-collider', {});

          //create opponent plane
          const planeEl = document.createElement("a-entity");
          planeEl.id = "opponentPlane";
          planeEl.object3D.position.set(DESKTOP_PLANE_POS.x, DESKTOP_PLANE_POS.y, DESKTOP_PLANE_POS.z)
          planeEl.setAttribute('gltf-model', '#paper_plane_ghost');
          planeEl.setAttribute('vertical-plane-movement', {});
          Context_AF.scene.appendChild(planeEl);

          uiToDisplay.push(Context_AF.opponentScoreUI)
        }
        //if this is collaborative mode then add plane collider only to the lead player
        else if (Context_AF.mode === MODES.collaborative && Context_AF.isLeadPlayer) {
          Context_AF.plane.setAttribute('obb-collider', {});
        }

        //add gameplay components and UI based on device type
        if(Context_AF.device === DEVICES.mobile) {
          Context_AF.camera.setAttribute('modified-look-controls', {});
          Context_AF.camera.setAttribute('vertical-pos-detection', {});
        }
        else {
          document.querySelector("#plane").setAttribute('vertical-plane-movement', {});
          uiToDisplay.push(Context_AF.horizontalControlsUI);
        }

        displayUI(uiToDisplay);
      })

      //listens for when to generate an obstacle
      socket.on(WEBSOCKET_ON_EVENTS.generateObstacle, (data) => {
        //create regular obstacle
        const obstacleEl = buildObstacle(Context_AF.mode, REGULAR_OBSTACLE.colour, REGULAR_OBSTACLE.className, REGULAR_OBSTACLE.transparent, REGULAR_OBSTACLE.opacity);

        //display ghost and current player obstacles if this is competitive mode
        if(Context_AF.mode === MODES.competitive) {

          //create ghost obstacle
          const ghostObstacleEl = buildObstacle(Context_AF.mode, GHOST_OBSTACLE.colour, GHOST_OBSTACLE.className, GHOST_OBSTACLE.transparent, GHOST_OBSTACLE.opacity);
          
          //set obstacle positions based on device type
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
      //Only the desktop player receives this event
      socket.on(WEBSOCKET_ON_EVENTS.planeUpdate, (data) => {
        //if collab mode then update the plane y pos
        if(Context_AF.mode === MODES.collaborative)
          planeYPosUpdate('#plane', data.planeYPosFactor, data.planeXRotation)
        //if comp mode then update the ghost plane y pos
        else if (Context_AF.mode === MODES.competitive)
          planeYPosUpdate('#opponentPlane', data.planeYPosFactor, data.planeXRotation)
      })

      //listens for when to start horizontal movement
      socket.on(WEBSOCKET_ON_EVENTS.horizontalMovement, (data) => {
        //select element name that the movement will apply to
        let objectName = "#plane";
        if(Context_AF.device === DEVICES.mobile)
          objectName = Context_AF.mode === "competitive" ? '#opponentPlane' : '#camera';

        //update the horizontal movement component value based on direction
        if(data.dir === HORIZONTAL_DIRECTIONS.left && objectName)
          document.querySelector(objectName).setAttribute('horizontal-movement', {enabled: true, xFactor: -1})
        else if(data.dir === HORIZONTAL_DIRECTIONS.right && objectName)
          document.querySelector(objectName).setAttribute('horizontal-movement', {enabled: true, xFactor: 1})
      })

      //listens for when to stop the horizontal movement
      socket.on(WEBSOCKET_ON_EVENTS.stopHorizontalMovement, (data) => {
        //select element name that the movement will apply to
        let objectName = "#plane";
        if(Context_AF.device === DEVICES.mobile){
          objectName = Context_AF.mode === "competitive" ? '#opponentPlane' : '#camera';
        }
        document.querySelector(objectName).setAttribute('horizontal-movement', {enabled: false})
      })

      //listens for when the score has been updated
      socket.on(WEBSOCKET_ON_EVENTS.scoreUpdate, (data) => {
        //update opponent score
        if(data.gameMode === MODES.competitive){
          Context_AF.opponentScore = data.score;
          Context_AF.opponentScorePlaceholder.innerText = Context_AF.opponentScore;
        }
        //update collab score
        else if(data.gameMode === MODES.collaborative) {
          const ambientSound = document.querySelector('[sound__chime]');
          ambientSound.components.sound__chime.playSound();
          Context_AF.score = data.score;
        }
        Context_AF.scorePlaceholder.innerText = Context_AF.score;
      })
      
      //listens for when the game timer has been updated
      socket.on(WEBSOCKET_ON_EVENTS.timeUpdate, (data) => {
        Context_AF.timerPlaceholder.innerText = data.timeLeft;
      })

      //listens for when the game has ended
      socket.on(WEBSOCKET_ON_EVENTS.game_end, (data) => {
        //update UI
        const uiToDisplay = [Context_AF.modeSelectionUI];
        Context_AF.modeSelectionTitle.innerText = 'Game Over!';
        Context_AF.scoreGameOverPlaceholder.innerText = Context_AF.score;
        uiToDisplay.push(Context_AF.gameOverUI);
        if(Context_AF.mode === MODES.competitive){
          uiToDisplay.push(Context_AF.opponentScoreGameOverUI);
          Context_AF.opponentScoreGameOverPlaceHolder.innerText = Context_AF.opponentScore;
        }
        if(Context_AF.isLeadPlayer)
          uiToDisplay.push(Context_AF.modeSelectionButtons);
        else
          uiToDisplay.push(Context_AF.modeSelectionWaitingUI);
        displayUI(uiToDisplay);

        //reset game play 
        removeElements(Context_AF.plane, Context_AF.camera, Context_AF.cloudGenerator, Context_AF.mode)

        //reset element positions
        resetPositions(Context_AF.device, Context_AF.plane, Context_AF.camera)

        //reset game logic
        Context_AF.score = 0
        Context_AF.opponentScore = 0
        Context_AF.mode = MODES.noMode;
      })
    }
});


//function displays and hides UI
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

//function updates the vertical-plane-movement component properties
function planeYPosUpdate (planeID, positionFactor, xRotation) {
  document.querySelector(planeID).setAttribute('vertical-plane-movement', {yPosFactor: positionFactor,
                                                                  xRotation: (xRotation)*(-1)
  })
}

//function removes elements when the game ends/reloads
function removeElements(plane, camera, cloudGenerator, mode) {
  //stop sound
  const ambientSound = document.querySelector('[sound__ambient]');
  ambientSound.components.sound__ambient.stopSound();

  //remove components
  plane.removeAttribute('vertical-plane-movement');
  plane.removeAttribute('obb-collider');
  plane.removeAttribute('obb-collider');

  cloudGenerator.removeAttribute('cloud-generator');
  camera.removeAttribute('modified-look-controls');
  camera.removeAttribute('vertical-pos-detection');

  if(mode === MODES.competitive)
    document.querySelector("#opponentPlane").parentNode.removeChild(document.querySelector("#opponentPlane"));

  //delete all obstacles rings
  const colliders = document.querySelectorAll('.obstacle');
  for (let i=0; i<colliders.length; i++)
    colliders[i].parentNode.removeChild(colliders[i]);
}

//function resets the positions of the camera and plane when the game resets
function resetPositions(device, plane, camera) {
  if (device === DEVICES.mobile) {
    plane.object3D.parent = camera.object3D;
    plane.object3D.position.set(MOBILE_PLANE_POS.x, MOBILE_PLANE_POS.y, MOBILE_PLANE_POS.z)
    camera.object3D.position.set(MOBILE_CAMERA.x, MOBILE_CAMERA.y, MOBILE_CAMERA.z);
  }
  else {
    camera.object3D.position.set(DESKTOP_CAMERA.x, DESKTOP_CAMERA.y, DESKTOP_CAMERA.z);
    camera.object3D.rotation.x = THREE.MathUtils.degToRad(DESKTOP_CAMERA.xRotation);
    plane.object3D.position.set(DESKTOP_PLANE_POS.x, DESKTOP_PLANE_POS.y, DESKTOP_PLANE_POS.z);
  }
}

//function creates an obstacle
function buildObstacle(mode, colour, className, transparent, opacity) {
  const obstacleEl = document.createElement('a-entity');
  obstacleEl.setAttribute('geometry', {primitive: 'torus',
                                        radius: 1.5,
                                        radiusTubular: 0.06});
  obstacleEl.setAttribute('material', {color: colour,
                                       transparent: transparent,
                                       opacity: opacity});
  //make the collider larger if it's collab mode and smaller if comp mode
  if(mode === MODES.collaborative)
    obstacleEl.setAttribute('ring-obstacle', {});
  else if (mode === MODES.competitive) {
    obstacleEl.setAttribute('ring-obstacle', {size: 1.8});
  }
  obstacleEl.setAttribute('obb-collider', {});
  obstacleEl.className = className;

  return obstacleEl
}