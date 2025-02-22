const express   = require("express")
const app       = express();
const http      = require("http");
const server    = http.createServer(app);
const io        = require('socket.io')(server);

const LISTEN_PORT       = 8080;
const ABS_STATIC_PATH   =__dirname + '/public';

//constants that may need to be moved to another file
//available game states
const GAME_STATES = {
    waiting: "waiting",
    modeSelection: "modeSelection",
    instructions: "instructions",
    playing: "playing",
    gameEnd: "gameEnd"
}

const MAX_PLAYERS = 2;

const PLAYING_ROOM = "playingRoom";


const playersData = [];
let currGameState = GAME_STATES.waiting;


app.get('/', function (req, res) {
    res.sendFile('index.html', {root:ABS_STATIC_PATH});
});

//socket.io stuff
//https://socket.io/docs/v3/emit-cheatsheet/
io.on('connection', (socket) => {
    console.log( socket.id + "connected" );

    //when a new client connects send them the current number of players on the server
    socket.emit("starter_data", {socketId: socket.id, players: playersData});

    socket.on('disconnect', () => {
        console.log(socket.id + " disconnected" );
        //remove the player from players if they are a valid player when they disconnect
        if(playersData.find(player => player.playerId === socket.id))
        {
            const userIndex = playersData.findIndex(item => item.playerId == socket.id);
            console.log("removal index ", userIndex)
            console.log("old arr: ", playersData)
            playersData.splice(userIndex, 1);
            console.log("new arr: ", playersData)
            if(playersData.length > 0)
            {
                playersData[0].isLeadPlayer = true;
                emitGameStateEvents();
            }
        }
        
            
        //if the remaining user is not a lead player, make them a lead player
    });

    //socket receives the player data such as device type, and if the player is a lead
    socket.on('player_ready', (data) => {   
        playersData.push({playerId: socket.id,
                          isLeadPlayer: playersData.length === 0,
                          device: data.device
        });

        console.log("players: ", playersData);

        //valid players are sent to the playing room
        socket.join(PLAYING_ROOM);
        
        //update the game state if two valid players are playing
        if(playersData.length === MAX_PLAYERS)
        {
            currGameState = GAME_STATES.modeSelection;
            //emit a game state event to the client
            emitGameStateEvents();
        }
    })

    //socket listens for when a mode has been selected
    socket.on('mode_selected', (data) => {
        console.log(data);
    })
});

server.listen(LISTEN_PORT);
app.use(express.static(__dirname + '/public'));

console.log("Listening on port: " + LISTEN_PORT);

//function emits events to the clients in the playing room based on the current game state
const emitGameStateEvents = function() {

    //getting id of the lead player
    const leadPlayerIndex = playersData.findIndex(player => player.isLeadPlayer)

    switch (currGameState) {
        //emit the waiting event with the ID of the lead player
        case GAME_STATES.waiting:
            io.to(PLAYING_ROOM).emit("waiting", playersData[leadPlayerIndex].playerId);
            break;
        //emit the mode selection event with the ID of the lead player
        case GAME_STATES.modeSelection:
            io.to(PLAYING_ROOM).emit("mode_selection", playersData[leadPlayerIndex].playerId);
            break;
        default:
            break;
    }

        
}