CHS.Help = {

    APP_NAME: 'help',
    SEND_BUTTON: "#ask_question",
    QUESTION_BOX: '.help_question',
    QUESTION_BOX_ORIGINAL_HEIGHT: '100px',

    CONTENT_CLASS: '#help-tab .message .content',

    CONFUSED_BUTTON: '.help_button',

    QUESTION_PREVIEW: '.question_preview',

    OPEN_TAB_BUTTON: '.open_help',

    THREAD_LOCATION: "#help-thread",
    HELP_TAB: "a[href='#help-tab']",

    markdownEditor: null,
    
    send_message: function(msg){
        var self = this;
        CHS.Utils.Ajax.send({
            app: self.APP_NAME,
            method: 'help_message',
            data: {
                code: CHS.Editor.getCode(),
                info: CHS.Editor.Information.getInfo(),
                content: msg
            },
            success: function(resp){
                $(self.QUESTION_BOX).val("");
                CHS.Help.reload();
            }
        });   
    },

    unhtmlEntityCode: function(code){
        code = code.replace(/&amp;/g, '&');
        return code;
    },

    reload: function() {
        var self = this;
        var info = CHS.Editor.Information.getInfo();
        CHS.Utils.Ajax.send({
            method: 'help_thread',
            app: 'help',
            data: {
                "user": info.uid,
                "id": info.id,
                "type": info.type
            }, 
            dataType: "HTML",
            type: "GET",
            success: function(resp){
                var prev_value = $(CHS.Help.THREAD_LOCATION).html();
                var num_prev = prev_value.split('<div class="message">').length;
                var num_new = resp.split('<div class="message">').length;
                if (num_prev != num_new) {
                    $(CHS.Help.THREAD_LOCATION).html(resp);
                    CHS.Help.format();

                    if (!$(CHS.Help.HELP_TAB).parent().hasClass("active")) {
                        $(CHS.Help.HELP_TAB).addClass("new-messages");
                    }
                }
            }
        });

        $(self.QUESTION_BOX).css('height', self.QUESTION_BOX_ORIGINAL_HEIGHT);


        // Reload menu every 30 seconds
        setTimeout(CHS.Help.reload, 30000);
    },


    format: function() {
        var self = this;

        /* This goes through all of the messages in the help tab and properly formats
         * them with markdown using the showdown converter. */
        $(self.CONTENT_CLASS).each(function(){
            var content = $(this).html();
            var html = self.converter.makeHtml(content);

            html = self.unhtmlEntityCode(html);

            $(this).html(html);
        });

        /* Make the textarea autogrow */
        $(self.QUESTION_BOX).autogrow();

        self.markdownEditor.run();

        $("#wmd-preview").html("");

        /* Set up syntax highlighting */
        prettyPrint();

    },

    setup: function(){
        var self = this;

        /* If the help tab does not exist, quit now. */
        if($("#help-tab").length == 0) return;

        /* Get the Markdown converter */
        self.converter = Markdown.getSanitizingConverter();

        /* If someone clicks the SEND_BUTTON simply send the message. */
        $(self.SEND_BUTTON).click(function(e){   
            e.preventDefault();
            var msg_content = $(self.QUESTION_BOX).val();
            CHS.Help.send_message(msg_content);          
        });

        /* If someone clicks the "Help, I'm confused" button, we write a message
         * for them and the send it. */
        $(self.CONFUSED_BUTTON).click(function(e){
            e.preventDefault();
            var msg_content = "Help! I'm confused.";
            CHS.Help.send_message(msg_content);
        });

        $(self.OPEN_TAB_BUTTON).click(function(e){
            e.preventDefault();
            CHS.Utils.switchToTab("#help-tab");
            $(CHS.Help.HELP_TAB).removeClass("new-messages");
        });


        $(CHS.Help.HELP_TAB).click(function() {
            $(this).removeClass("new-messages");
        });

        self.markdownEditor = new Markdown.Editor(self.converter);
        self.format();
        self.reload();
    },
};
