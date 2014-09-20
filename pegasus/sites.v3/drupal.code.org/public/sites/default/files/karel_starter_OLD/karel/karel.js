Karel = {};

function move(){
    KarelRunner.move();
}

function turnLeft(){
    KarelRunner.turnLeft();    
}

function takeBall(){
    KarelRunner.takeBall(); 
}

function putBall(){
    KarelRunner.putBall();
}

function frontIsClear(){
    return KarelRunner.frontIsClear(true);
}

function leftIsClear(){
    return KarelRunner.leftIsClear(true);
}

function rightIsClear(){
    return KarelRunner.rightIsClear(true);
}

function frontIsBlocked(){
    return KarelRunner.frontIsClear(false);
}

function leftIsBlocked(){
    return KarelRunner.leftIsClear(false);
}

function rightIsBlocked(){
    return KarelRunner.rightIsClear(false);
}

function ballsPresent(){
    return KarelRunner.ballsPresent();
}

function noBallsPresent(){
    return !KarelRunner.ballsPresent();
}

function facingNorth(){
    return KarelRunner.facingNorth();
}

function notFacingNorth(){
    return !KarelRunner.facingNorth();
}

function facingSouth(){
    return KarelRunner.facingSouth();
}

function notFacingSouth(){
    return !KarelRunner.facingSouth();
}

function facingEast(){
    return KarelRunner.facingEast();
}

function notFacingEast(){
    return !KarelRunner.facingEast();
}

function facingWest(){
    return KarelRunner.facingWest();
}

function notFacingWest(){
    return !KarelRunner.facingWest();
}


/* Functions for backwards compatibility with old-fashioned robots. */
function putBeeper(){
    putBall();
}

function pickBeeper(){
    takeBall();
}

function beepersPresent(){
    return ballsPresent();
}

function noBeepersPresent(){
    return noBeepersPresent();
}
/* End backwards compatibility functions */

/* Functions provided by SuperKarel */
SuperKarel = {
    turnRight: function(){
        KarelRunner.turnRight();
    },
    
    turnAround: function(){
        KarelRunner.turnAround();
    }
};

Karel.INFINITE_LOOP = -4;
Karel.ERROR_NO_BEEPERS = -3;
Karel.ERROR_CRASH_INTO_WALL = -2;
Karel.ERROR = -1;
Karel.EAST = 0;
Karel.NORTH = 1;
Karel.WEST = 2;
Karel.SOUTH = 3;
Karel.NUM_DIRS = 4;


Karel.MOVE = 5;
Karel.PUT_BEEPER = 6;
Karel.PICK_BEEPER = 7;
Karel.TURN_LEFT = 8;
Karel.TURN_RIGHT = 9;
Karel.TURN_AROUND = 10;



// Karel.EAST_IMAGE = new WebImage('./static/img/karel_80_east.png');
// Karel.NORTH_IMAGE = new WebImage('./static/img/karel_80_north.png');
// Karel.WEST_IMAGE = new WebImage('./static/img/karel_80_west.png');
// Karel.SOUTH_IMAGE = new WebImage('./static/img/karel_80_south.png');

Karel.EAST_IMAGE = new WebImage('./static/img/karel_photo_east.png');
Karel.NORTH_IMAGE = new WebImage('./static/img/karel_photo_north.png');
Karel.WEST_IMAGE = new WebImage('./static/img/karel_photo_west.png');
Karel.SOUTH_IMAGE = new WebImage('./static/img/karel_photo_south.png');


Karel.EAST_IMAGE.setSize(77,77);
Karel.NORTH_IMAGE.setSize(77,77);
Karel.WEST_IMAGE.setSize(77,77);
Karel.SOUTH_IMAGE.setSize(77,77);
