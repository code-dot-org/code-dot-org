CHS.Editor = {
    /* Editor Constants */
    GRAPHICS: 0,
    CONSOLE: 1,
    KAREL: 2,
    
    APP_NAME: 'editor',

    SUBMIT_BUTTON: "#submit-button",
    NEXT_BUTTON: "#next-button",
    SAVE_BUTTON: "#save-button",
             
    run: function() {
        this.stop();
        
        this.myCodeMirror.save(); /* Must save to get the value back in the textarea */
        var code = this.editor.val();

        if(this.type == this.KAREL){
            /* 2nd @param is whether it's running for the sake
             * of autograding */
            KarelRunner.run(code, false);
        }else{
            var wrap = '(function(){'+ code + '\n\nif(typeof start == "function") {start();} }())';
            eval(wrap);
        }
    },
    
    stop: function(){
        Graphics.fullReset();
        Console.clear();
        if(this.type == this.KAREL){
            KarelRunner.reset();
        }
        CHS.Error.hide();
    },
    
    getCode: function(){
        this.myCodeMirror.save(); /* Must save to get the value back in the textarea */
        var code = this.editor.val();
        return code;
    },

    setup: function(){
        var self = this;
        
        /* Graphics program is the default type */
        this.type = this.GRAPHICS;
        this.editor = $("#editor");

        Graphics.start();


        // Need the .get(0) to get the actual textarea as opposed to the jQuery textarea
        this.myCodeMirror = CodeMirror.fromTextArea(this.editor.get(0), {
            lineNumbers: true,
            matchBrackets: true,
            lineWrapping: true,
            indentWithTabs: true,
            indentUnit: 4
        });
        

        // A little bit better height for editor, can be improved.
        var CHEAT_SHEET_CORRECTION = 65;
        //var height = $(window).height() - $(".navbar").height() - $(".action").height() - $(".editor-exercise").height() - CHEAT_SHEET_CORRECTION;
        $(".CodeMirror-scroll").css('height', 400);

        // Set the height of the right side
        var rightHeight = $(window).height() - $(".navbar").height();
        $("#right").height(rightHeight);

        
        if(Console.exists()){
            this.type = this.CONSOLE;
        }else{

            if($("canvas").attr('data-type') == "graphics"){
                this.type = this.GRAPHICS;

            }else{
                this.type = this.KAREL;
                KarelRunner.loadWorld(this.KAREL_WORLD);    

                if($("canvas").attr('data-type') == "superkarel"){
                    window.turnRight = SuperKarel.turnRight;
                    window.turnAround = SuperKarel.turnAround;
                }

                //var speed = 30;
                //KarelRunner.setSpeed(speed);
                /*$("#speed_slider").slider({
                    slide: function(event, ui){
                        KarelRunner.setSpeed(ui.value/100); // 100 is default max 
                    },
                    value: speed
                });
                */
                
                $("#karelworld").change(function(){
                    var sel = $(this).find(":selected");
                    var world = sel.attr('data-world');
                    
                    CHS.Editor.KAREL_WORLD = world;
                    KarelRunner.loadWorld(CHS.Editor.KAREL_WORLD);    
                });
            }
        }

        $(".run_code").bind("click", function() {
            CHS.Utils.switchToTab("#run-tab")
            self.run();
        });

        $("#stop").click(function(){
            self.stop();
        });

        window.onerror = function(message, url, lineNumber) {  
            console.log(message);
            console.log(url);
            self.stop();    // hides the error message, so it must be before show
            CHS.Error.show({
                message:message,
                url:url,
                lineNumber:lineNumber,
                info: self.Information.getInfo(),
                log:true
            });
            return true;
        };        
    }
};







CHS.Editor.Information = (function() {
    var setInfo = function(options){
        this.type = options.type;
        this.id = options.id;
        this.uid = options.uid;
        this.own_page = options.own_page;
        this.demo = options.demo;
        this.progtype = options.progtype;
    };
    
    var getInfo = function(){
        return {
            type: this.type,
            id: this.id,
            uid: this.uid,
            own_page:this.own_page,
            demo: this.demo,
            progtype: this.progtype
        }
    };

    var isOwnPage = function(){
        return this.own_page;
    };

    return {
        setInfo: setInfo,
        getInfo: getInfo,
        isOwnPage: isOwnPage
    }

}());