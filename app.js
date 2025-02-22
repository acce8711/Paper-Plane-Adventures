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
    loading: "loading",
    modeSelection: "modeSelection",
    instructions: "instructions",
    playing: "playing",
    gameEnd: "gameEnd"
}

const MAX_PLAYERS = 2;


const playersData = [];
let currGameState = GAME_STATES.loading;


app.get('/', function (req, res) {
    res.sendFile('index.html', {root:ABS_STATIC_PATH});
});

//socket.io stuff
//https://socket.io/docs/v3/emit-cheatsheet/
io.on('connection', (socket) => {
    console.log( socket.id + "connected" );

    //when a new client connects send them the current number of players on the server
    socket.emit("starter_data", playersData);

    socket.on('disconnect', () => {
        console.log( socket.id + " disconnected" );
        //remove the player from players if they are a valid player when they disconnect
        if(playersData.find(player => player.id === socket.id))
        {
            const userIndex = playersData.findIndex(item => item.id == socket.id);
            console.log("removal index ", userIndex)
            console.log("old arr: ", playersData)
            playersData.splice(userIndex, 1);
            console.log("new arr: ", playersData)
            if(playersData.length > 0)
            {
                playersData[0].leadPlayer = true;
                updateState();
            }
        }
        
            
        //if the remaining user is not a lead player, make them a lead player
    });

    socket.on("red", (data) => {
        console.log( "red event received" );
        io.emit("color_change", {r:255, g:0, b:0});         //to all connected clients
        //io.socket.emit("color_change", {r:255, g:0, b:0});  //to everyone but sender
    });

    socket.on("blue", (data) => {
        console.log( "blue event received" );
        io.emit("color_change", {r:0, g:0, b:255});
    });

    //question 1: how do you continuously update the network, e.g., users position and orientation?
    //question 2: how do you synch clients to current state?
    
    //socket receives the player data such as device type, and if the player is a lead
    socket.on('player_ready', (data) => {   
        playersData.push({id: socket.id,
                          leadPlayer: playersData.length === 0,
                          device: data.device
        });
        console.log(playersData);

        //valid users can join the playing room
        socket.join("playingRoom");
        updateState();
        //io.to(playersData[0].id).emit("message", "this is player special");
    })

    
});

server.listen(LISTEN_PORT);
app.use(express.static(__dirname + '/public'));

console.log("Listening on port: " + LISTEN_PORT);

const updateState = function() {
    //if two players are ready then begin mode selection
    if (playersData.length === MAX_PLAYERS)
    {
        currGameState = GAME_STATES.modeSelection;
        io.to("playingRoom").emit("playing", currGameState)
    }

    //if there is less than 2 valid players then set game state to loading
    else if (playersData.length < MAX_PLAYERS)
    {
        currGameState = GAME_STATES.loading;
        io.to("playingRoom").emit("playing", currGameState)
    }
        
}