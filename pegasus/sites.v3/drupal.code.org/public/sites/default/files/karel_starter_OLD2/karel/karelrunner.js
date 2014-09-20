var KarelRunner = {
    
    commands: [],
    
    delayTime: 500,

    INFINITE_LOOP_DETECTOR: 10000,

    KAREL_INFINITE_LOOP_COUNTER: 10000,

    /* We add this function to all while loops to prevent infinite loops. */
    KAREL_INFINITE_LOOP_DETECTOR: function(){
        this.KAREL_INFINITE_LOOP_COUNTER--;

        if(this.KAREL_INFINITE_LOOP_COUNTER == 0){
            this.commands.push(Karel.INFINITE_LOOP);
        }

        return this.KAREL_INFINITE_LOOP_COUNTER > 0;
    },
    
    loadWorld: function(world){

        var prefix = './worlds/';
        var suffix = '.json';
        var url = prefix + world + suffix;
        
        Graphics.globalTimer = false;
        
        Graphics.setSize(400, 400);

        var data = {
             "rows": 5,
             "cols": 5,
             "dir": "EAST",
             "start": {
                 "row": 0,
                 "col": 0
              },
             "walls":
             [
             ],
             "beepers":
             [
                [0, 2, 1]
             ]
         }

        var self = this;

        self.createWorld(data.rows, data.cols);
        self.setKarelLocation(data.start.row, data.start.col);
        self.setKarelDirection(data.dir, self.world);
        self.world.createWalls(data.walls);
        self.world.setupBeepers(data.beepers);
        self.setup();
    },
    
    setup: function(){        
        this.world.draw();
        Graphics.redraw();       
    },
    
    /*
     * @param world - used to tell which world to set the direction for
     * It could be the visible world or the solutionWorld
     */
    setKarelDirection: function(dir, world){
        var val;
        if(dir == "EAST"){
            val = Karel.EAST;
        }
        if(dir == "WEST"){
            val = Karel.WEST;
        }
        if(dir == "SOUTH"){
            val = Karel.SOUTH;
        }
        if(dir == "NORTH"){
            val = Karel.NORTH;
        }
        world.setKarelDir(val);
    },

    // Returns the direction name from the integer value
    dirName: function(dir) {
        switch(dir) {
            case 0: return "EAST";
            case 1: return "NORTH";
            case 2: return "WEST";
            case 3: return "SOUTH";
        }
    },
    
    setKarelLocation: function(row, col){
        this.world.setKarelLocation(row, col);
    },
    
    createWorld: function(rows, cols){
        this.world = new KarelWorld(rows, cols);
    },
    
    
    reset: function(){
        this.commands = [];
        this.KAREL_INFINITE_LOOP_COUNTER = this.INFINITE_LOOP_DETECTOR;
        if(typeof this.world != "undefined"){
            this.world.reset();  
        }
        Graphics.redraw();
        //this.Tester.hideMessage();
    },

    /* This takes the code typed in by the user and tries to make it safe for infinite loops. We
     * Do this by looking for anything that looks like a while loop and adding another variable
     * to the condition with an && which is always true unless we think it is an infinite loop. 
     */
    makeSafeForInfiniteLoops: function(code){
        var whileLoopRegEx = /while\s*\((.*)\)/gi;
        var result = code.replace(whileLoopRegEx, "while($1 && (KarelRunner.KAREL_INFINITE_LOOP_DETECTOR()))");
        //CHS.log(result);
        return result;
    },
    
    run: function(code, grading){
        this.reset();
        
        if (KarelRunner.Errors.hasErrors({
                code: code,
                checkMissingParens: true,
                checkUndefinedCondition: true
            })
        ) {
            console.log("had errors");
            return;
        }

        code = this.makeSafeForInfiniteLoops(code);
        this.execute(code);
        if (grading != true) {
            this.animate();    
        } else {
            //var graded = this.Tester.testSolution(true);
            //KarelGrader.setWorldStatus(this.world, graded.success);
        }
    },
    
    execute: function(code){
        eval(code);
        if(typeof start == 'function')
            start();
    },
    
    drawError: function(error){
        var rect = new Rectangle(300, 150);
        rect.setPosition(getWidth()/2 - rect.getWidth()/2, getHeight()/2 - rect.getHeight()/2);
        rect.setColor(Color.red);
        
        var errorMsg;
        if(error == Karel.ERROR_NO_BEEPERS){
            errorMsg = "No tennis balls to pick up!";
        }else if(error == Karel.ERROR_CRASH_INTO_WALL){
            errorMsg = "Karel Crashed into a Wall!";
        }else if(error == Karel.INFINITE_LOOP){
            errorMsg = "Karel is in an infinite loop!";
        }else{
            errorMsg = "Karel Error!";
        }
        
        var text = new Text(errorMsg);
        text.setFont("14pt Arial");
        text.setPosition(getWidth()/2 - text.getWidth()/2, getHeight()/2 + text.getHeight()/2);
        
        add(rect);
        add(text);
        
        
    },
    

    animate: function(){
        var self = this;
        this.commandIndex = 0;
        console.log(this.commands);

        function runStep(){
            var command = self.commands[self.commandIndex];
            if(command < 0) {
                self.drawError(command);
                return;
            }
            
            if(self.commandIndex < self.commands.length - 1){
                setTimeout(runStep, KarelRunner.delayTime);
            }

            self.world.animate(command);
            self.commandIndex++;
            Graphics.redraw();

            /*
            // If there are no more commands, test the solution
            if(self.commandIndex >= self.commands.length){
                var graded = self.Tester.testSolution(false);
            }
            */
        }  
        
        this.world.reset();

        if(this.commands.length >= this.INFINITE_LOOP_DETECTOR){
            this.drawError(Karel.INFINITE_LOOP);
        }else{
            setTimeout(runStep, KarelRunner.delayTime);
        }
        Graphics.redraw();       
    },
    
    /* Set the speed of the karel animation. Speed is a number
        from [0,1], where 1 is the fastest speed and 0 is the slowest.
        We should interpolate between the min and max values. However
        the speed is a number from 0 to 1 indicating how _fast_, but
        what we really want to convert this to is a timer delay. A faster
        speed would actually have a smaller timer delay. */
    setSpeed: function(speed){
        /* This is really bad. I'll come up with a better way later. */
        var min = 5;
        var max = 500;
        var speed = min + (max - min) * speed;
        
        KarelRunner.delayTime = max - speed;
    },
    
    
    validateCondition: function(){
        var len = this.commands.length;
        if(len > this.INFINITE_LOOP_DETECTOR) {
            this.commands.push(Karel.INFINITE_LOOP);
            return false;    
        }    
        if(len > 0 && this.commands[len - 1] < 0) return false;
        return true;
    },
    
    /* code */
    move: function(){
        if(this.world.canMove()){
            this.world.move();
            this.commands.push(Karel.MOVE);
        }else{
            this.commands.push(Karel.ERROR_CRASH_INTO_WALL);
        }
    },
    
    putBall: function(){
        this.world.putBall();
        this.commands.push(Karel.PUT_BEEPER);
    },
    
    takeBall: function(){
        if(this.world.ballsPresent()){
            this.world.takeBall();
            this.commands.push(Karel.PICK_BEEPER);
        }else{
            this.commands.push(Karel.ERROR_NO_BEEPERS);
        }
    },
    
    turnLeft: function(){
        this.world.turnLeft();
        this.commands.push(Karel.TURN_LEFT);
    },
    
    frontIsClear: function(test){
        if (!this.validateCondition()) return false;
        return this.world.frontIsClear() == test;
    },
    
    leftIsClear: function(test){
        if (!this.validateCondition()) return false;
        return this.world.leftIsClear() == test;
    },
    
    rightIsClear: function(test){
        if (!this.validateCondition()) return false;
        return this.world.rightIsClear() == test;
    },
    
    ballsPresent: function(){
        if (!this.validateCondition()) return false;
        return this.world.ballsPresent();        
    },
    
    facingNorth: function(){
        if (!this.validateCondition()) return false;
        return this.world.facingNorth();                
    },

    facingSouth: function(){
        if (!this.validateCondition()) return false;
        return this.world.facingSouth();                
    },

    facingEast: function(){
        if (!this.validateCondition()) return false;
        return this.world.facingEast();                
    },

    facingWest: function(){
        if (!this.validateCondition()) return false;
        return this.world.facingWest();                
    },
    
    /* Super Karel methods */
    
    turnRight: function(){
        this.world.turnRight();
        this.commands.push(Karel.TURN_RIGHT);
    },
    
    turnAround: function(){
        this.world.turnAround();
        this.commands.push(Karel.TURN_AROUND);        
    }

};