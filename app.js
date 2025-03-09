const { time } = require("console");
const express   = require("express")
const app       = express();
const http      = require("http");
const server    = http.createServer(app);
const io        = require('socket.io')(server);

const LISTEN_PORT       = 8080;
const ABS_STATIC_PATH   =__dirname + '/public';

const GAME_STATES = {
    waiting: "waiting",
    modeSelection: "modeSelection",
    instructions: "instructions",
    playing: "playing",
    gameEnd: "gameEnd"
}

const HORIZONTAL_DIRECTIONS = {
    left: 'left',
    right: 'right'
}

const MAX_PLAYERS = 2;
const PLAYING_ROOM = "playingRoom";
const playersData = [];
const TIME = 60;

let currGameState = GAME_STATES.waiting;
let currMode = "";
let timeLeft = TIME;



app.get('/', function (req, res) {
    res.sendFile('index.html', {root:ABS_STATIC_PATH});
});

//socket.io stuff
//https://socket.io/docs/v3/emit-cheatsheet/
io.on('connection', (socket) => {
    console.log( socket.id + "connected" );

    //when a new client connects send them the player data
    socket.emit("starter_data", {socketId: socket.id, players: playersData});

    socket.on('disconnect', () => {
        //remove the player from players if they are a valid player when they disconnect
        if(playersData.find(player => player.playerId === socket.id))
        {
            const userIndex = playersData.findIndex(item => item.playerId == socket.id);
            playersData.splice(userIndex, 1);
            //update the lead player
            if(playersData.length > 0){
                playersData[0].isLeadPlayer = true;
                currGameState = GAME_STATES.waiting;
                emitGameStateEvents();
            }
        }
        
            
        //if the remaining user is not a lead player, make them a lead player
    });

    //socket receives the player data such as device type and if a player is a lead
    socket.on('player_ready', (data) => {   
        playersData.push({playerId: socket.id,
                          isLeadPlayer: playersData.length === 0,
                          device: data.device,
                          playerContinue: false,
                          score: 0
        });

        //valid players are sent to the playing room
        socket.join(PLAYING_ROOM);
        
        //update the game state if two valid players are playing
        if(playersData.length === MAX_PLAYERS) {
            currGameState = GAME_STATES.modeSelection;
            //emit a game state event to the client
            emitGameStateEvents();
        }
    })

    //socket listens for when a mode has been selected by the lead player
    socket.on('mode_selected', (data) => {
        currMode = data;
        currGameState = GAME_STATES.instructions;
        emitGameStateEvents();
    })

    //socket listens for when a player is ready to continue (is done reading the instructions)
    socket.on('player_continue', (data) => {
        const playerIndex = playersData.findIndex(item => item.playerId === socket.id);
        playersData[playerIndex].playerContinue = true;

        let numPlayersContinue = 0;
        playersData.forEach(player => {if (player.playerContinue) numPlayersContinue++});

        //if both players are ready to continue
        if (numPlayersContinue === MAX_PLAYERS)
        {
            for(let i=0; i<playersData.length; i++){
                playersData[i].playerContinue = false;
            }
            currGameState = GAME_STATES.playing;
            emitGameStateEvents();
        }
    })

    //socket listens when the vertical pos has been updated
    socket.on('vertical_pos_update', (data) => {
        if(currGameState === GAME_STATES.playing){
            // get the id of the player who didn't emit this event and send an event ot them
            const playerIndex = playersData.findIndex(player => player.playerId != socket.id);
            const playerID = playersData[playerIndex].playerId;
            io.to(playerID).emit('plane_update', {planeXRotation: data.planeXRotation, planeYPosFactor: data.planeYPosFactor});
        }
        })

    //socket listens when the right wind button has been pressed
    socket.on('move_right', (data) => {
        if(currGameState === GAME_STATES.playing) {
            io.to(PLAYING_ROOM).emit('start_horizontal_movement', {dir: HORIZONTAL_DIRECTIONS.right})
        }
    })

    //socket listens when the left wind button has been pressed
    socket.on('move_left', (data) => {
        if(currGameState === GAME_STATES.playing) {
            io.to(PLAYING_ROOM).emit('start_horizontal_movement', {dir: HORIZONTAL_DIRECTIONS.left})
        }
    })

    //socket listens when a wind button has been released
    socket.on('stop_horizontal_movement', (data) => {
        if(currGameState === GAME_STATES.playing) {
            io.to(PLAYING_ROOM).emit('stop_horizontal')
        }
    })

    //listens for an update in score
    socket.on('score', (data) => {
        if(currGameState === GAME_STATES.playing) {
            //send event to player who didn't emit this event
            const playerIndex = playersData.findIndex(player => player.playerId != socket.id);
            const playerID = playersData[playerIndex].playerId;
            io.to(playerID).emit('score_update', {score: data.score, gameMode: currMode});
        }
    })
    
});

server.listen(LISTEN_PORT);
app.use(express.static(__dirname + '/public'));

console.log("Listening on port: " + LISTEN_PORT);

//function emits events to the clients in the playing room based on the current game state
const emitGameStateEvents = function() {
    //getting id of the lead player
    const leadPlayerIndex = playersData.findIndex(player => player.isLeadPlayer)

    //emit events based on the current game state
    switch (currGameState) {
        //emit the waiting event with the ID of the lead player
        case GAME_STATES.waiting:
            io.to(PLAYING_ROOM).emit("waiting", {leadPlayerID: playersData[leadPlayerIndex].playerId});
            break;
        //emit the mode selection event 
        case GAME_STATES.modeSelection:
            io.to(PLAYING_ROOM).emit("mode_selection");
            break;
        //emit the instructions event with the selected mode
        case GAME_STATES.instructions:
            io.to(PLAYING_ROOM).emit("instructions", {mode: currMode});
            break;
        //emit the playing event with the time left
        case GAME_STATES.playing:
            io.to(PLAYING_ROOM).emit("playing", {timeLeft: 20});
            //code reference: https://stackoverflow.com/questions/29311311/how-do-i-take-away-from-a-variable-a-certain-number-of-times-every-second-javasc/29311357
            //update time every second and send obstacle coordinates every 5 seconds
            let secondsPassed = 0;
            const intervalId = setInterval(function() {
                    secondsPassed += 1;
                    //when timer is up, end the game
                    if(timeLeft === 0) {
                        clearInterval(intervalId);
                        timeLeft = 40;
                        currGameState = GAME_STATES.gameEnd;
                        emitGameStateEvents();
                    }
                    else if (currGameState === GAME_STATES.waiting)
                    {
                        clearInterval(intervalId);
                        timeLeft = 40;
                    }
                    else {
                        timeLeft--;
                        io.to(PLAYING_ROOM).emit('time_update', {timeLeft: timeLeft});
                    }

                    //send obstacle ring coordinates every 5 seconds
                    if(secondsPassed === 5){
                        secondsPassed = 0;
                        if(currMode === "competitive")
                            io.to(PLAYING_ROOM).emit('generate_obstacle', {mobileObstacles: {x:0, y:Math.floor(Math.random() * 9 - 5), z:-50},
                                                                           desktopObstacles: {x: Math.floor(Math.random() * 9 - 5), y:0, z:-50}});
                        else
                            io.to(PLAYING_ROOM).emit('generate_obstacle', {x: Math.floor(Math.random() * 9 - 5), y:Math.floor(Math.random() * 9 - 5), z:-50});
                    }
                }, 1000)
            break;
        //emit the game end event
        case GAME_STATES.gameEnd:
            io.to(PLAYING_ROOM).emit('game_end');
            break;
        default:
            break;
    }

        
}