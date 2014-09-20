CHS = CodeHS = {};

CHS.log = function(msg){
    console.log(msg);
}


CHS.Splash = {
    APP_NAME: 'core',
    
    signup: function(){
        var email = $.trim($("#email-input").val());
        if(!CHS.Utils.validEmail(email)) return;
        
        CHS.Utils.Ajax.send({
            method: 'email_signup',
            app: this.APP_NAME,
            data: {
                email: email
            }, 
            success: function(resp){
                if(resp.status == "ok"){
                    $("#email-input, #email_signup").fadeOut(function(){
                        $("#email_signup_thanks").fadeIn();
                    });
                }
            }
        });
    },
    
    setup: function(){
        var self = this;
        $("#email_signup").click(function(){
           self.signup(); 
        });
        $("#email-input").keypress(function(e){
            if(e.which == 13){ // enter key
                           self.signup();
            }
        })
    }
}

CHS.Pages = {
    Other: -1,
    Editor: 0,
    Landing: 1,
    Learn: 2,
    Question_Queue:3,
    Video:4,
    UserPage:5,
    Demo: 6,
    Showcase: 7,
    
    currentPage: function(){
        if(window.location.pathname == "/editor/"){
            return this.Editor;
        }
        if(window.location.pathname == "/"){
            return this.Landing;
        }
        if (window.location.pathname == "/help/questions") {
            return this.Question_Queue;
        }
        if (window.location.pathname.substr(0,"/learn/video/".length) == "/learn/video/") {
            return this.Video;
        }

        if(window.location.pathname.indexOf("/demos/") == 0 && window.location.pathname.length > "/demos/".length){
            return this.Demo;
        }

        if (window.location.pathname.substr(0,"/user/".length) == "/user/") {
            return this.UserPage;
        }

        if(window.location.pathname.indexOf('/editor/showcase/') == 0){
            return this.Showcase;
        }

        return this.Other;
    }
};



CHS.Question_Queue = (function() {
    var bind_doesnt_need_answer = function () {
        $(".mark_doesnt_need_answer").click(function() {
            console.log('here');
            var thread_id = $(this).attr("data-thread");
            
            CHS.Utils.Ajax.send({
                method: 'help_message_doesnt_need_answer',
                app: 'help',
                data: {
                    thread: thread_id
                },
                success: function(resp){
                    console.log(resp);
                    window.location.reload();
                }
            });
        });
    };
    var setup = function(options){
        bind_doesnt_need_answer();
    };

    return {
        setup: setup
    }

}());

CHS.ProgressMap = (function() {
    var setup = function() {
        $(".collapse").collapse({
            toggle: false,
            parent: "#progress-map"
        });

        $(".collapse").on('hide', function() {
            var section = $(this).attr("data-section");
            $("i[data-section='" + section + "']").removeClass("icon-minus").addClass("icon-plus");
        });

        $(".collapse").on('show', function() {
            var section = $(this).attr("data-section");
            $("i[data-section='" + section + "']").removeClass("icon-plus").addClass("icon-minus");
        });
    };

    return {
        setup:setup
    }

}());


CHS.Setup = function(){
    if(CHS.Pages.currentPage() == CHS.Pages.Editor ||
       CHS.Pages.currentPage() == CHS.Pages.Demo ||
       CHS.Pages.currentPage() == CHS.Pages.Showcase ){
        CHS.Editor.setup({
            mentor: CHS.User.isMentor
        });
        CHS.Help.setup();
        CHS.Question_Queue.setup();
    }else if(CHS.Pages.currentPage() == CHS.Pages.Landing){
        //CHS.Splash.setup();
    }else if(CHS.Pages.currentPage() == CHS.Pages.Question_Queue) {
        CHS.Question_Queue.setup();
    } else if (CHS.Pages.currentPage() == CHS.Pages.Video) {
        CHS.Video.setup();
    }
    
    CHS.Utils.activateReadyHooks();

    if (CHS.User.logged_in) {
        CHS.NotificationMenu.setup();
    }

    if (CHS.User.isMentor) {
        CHS.AdminMenu.setup();
    }
}

$(document).ready(function(){
    CodeHS.Setup();
});

