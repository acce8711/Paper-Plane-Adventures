//device types
const DEVICES = {
    mobile: "mobile",
    desktop: "desktop"
}

const MODES = {
    competitive: 'competitive',
    collaborative: 'collaborative',
    noMode: 'noMode'
}


const DESKTOP_CAMERA = {
    x: 0,
    y: 1,
    z: 6,
    xRotation: 0
}

const MOBILE_CAMERA = {
    x: 0,
    y: 1.6,
    z: 0,
    xRotation: 0
}

const MOBILE_PLANE_POS = {
    x: 0,
    y: -1,
    z: -1.9
}

const DESKTOP_PLANE_POS = {
    x: 0,
    y: 0.6,
    z: -1.9
}

const REGULAR_OBSTACLE = {
    colour: '#27E5F0',
    className: 'regularObstacle obstacle',
    transparent: false,
    opacity: 1
}

const GHOST_OBSTACLE = {
    colour: '#FFFFFF',
    className: 'ghostCollider obstacle',
    transparent: true,
    opacity: 0.15
}

//websocket emit constants
const WEBSOCKET_EMIT_EVENTS = {
    modeSelected: 'mode_selected',
    playerContinue: 'player_continue',
    verticalPosUpdate: 'vertical_pos_update',
    moveRight: 'move_right',
    moveLeft: 'move_left',
    stopHorizontalMovement: 'stop_horizontal_movement',
    score: 'score',
    playerReady: 'player_ready'
}

const WEBSOCKET_ON_EVENTS = {
    connect: 'connect',
    starterData: 'starter_data',
    waiting: 'waiting',
    modeSelection: 'mode_selection',
    instructions: 'instructions',
    playing: 'playing',
    generateObstacle: 'generate_obstacle',
    planeUpdate: 'plane_update',
    horizontalMovement: 'start_horizontal_movement',
    stopHorizontalMovement: 'stop_horizontal',
    scoreUpdate: 'score_update',
    timeUpdate: 'time_update',
    game_end: 'game_end'
}

const HORIZONTAL_DIRECTIONS = {
    left: 'left',
    right: 'right'
}


const EMPTY_ID = "";

//UI constants
const HIDE_UI = "none";
const SHOW_UI = "flex";
const ACTIVE_UI = 'activeUI';

