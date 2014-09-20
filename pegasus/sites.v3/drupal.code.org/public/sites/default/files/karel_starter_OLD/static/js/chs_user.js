/* Keep track of the current logged in user, whether or not they are
   authenticated, as well as basic information */
CHS.User = {
    first_name: "",
    last_name: "",
    logged_in: false,
    id: -1,
    isMentor: false,
    
    name: function(){
        return this.first_name +  " " + this.last_name;
    },
    
    isLoggedIn: function(){
        return this.logged_in;
    },
    
    /* Set a user given a first name, last name, and id */
    setUser: function(options){
        this.first_name = options.first_name;
        this.last_name = options.last_name;
        this.logged_in = true;
        this.id = options.id;
        this.isMentor = options.isMentor != undefined ? options.isMentor : false;
    },

    updatePhoto: function(options) {
        $("#update-modal").modal('hide');
        $("#update-modal").remove();

        $("body").off('keypress');
        $("#update-save-button").off('click');

        if (!options.update) {
            return;
        }

        CHS.Utils.Ajax.send({
            method: 'update_photo',
            app: 'core',
            data: {
                photo: options.photo
            }, 
            success: function(resp){
                if(resp.status == "ok"){
                    $("#profile-photo").attr("src", options.photo);
                }
            }
        });

        
    },

    setup: function(options) {
        $("#class-select").change(function() {
            var sel = $(this).find(":selected");
            var class_id = $(sel).attr("data-class");
            var uid = $(sel).attr("data-user");
            window.location = "/user/setclass/" + uid + "/" + class_id;
        });

        $("#plan-select").change(function() {
            var sel = $(this).find(":selected");
            var plan_id = $(sel).attr("data-plan-id");
            var uid = $(sel).attr("data-user");
            window.location = "/user/setplan/" + uid + "/" + plan_id;
        });


        if (options.own_page) {
            $("#profile-photo").click(function() {
                var data = {
                   msg: "Type a url to update your profile photo.",
                   header: "CodeHS: Update Photo",
                   placeholder: "url of image"
               };

               var update_box = $('#update-template').tmpl(data);
               update_box.appendTo("body");
               $("#update-modal").modal({
                    "backdrop":"static"
               });
               $(".alert-close, #update-cancel-button").on("click", function() {
                    CHS.User.updatePhoto({
                        update: false
                    });
               });

               $("body").keypress(function(e) {
                    if (e.which != 13) return;
                    CHS.User.updatePhoto({
                        update: true,
                        photo: $.trim($("#update-input").val())
                    });
               });

               $("#update-save-button").on("click", function() {
                    CHS.User.updatePhoto({
                        update: true,
                        photo: $.trim($("#update-input").val())
                    });
               });
            });
        }
        
    },

};
