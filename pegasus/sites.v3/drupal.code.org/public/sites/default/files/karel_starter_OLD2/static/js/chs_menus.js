/*
 * NotificationMenu
 * ============================
 * Handles the reloading of the notification menu.
 *
 * Call setup and it will auto-reload and update for the user
 * every 30 seconds.
 *
 * Note: This may end up slowing down stuff for people, 
 * since it's doing a lot of requests, but hopefully it's not
 * too bad. We'll have to see.
 */
CHS.NotificationMenu = (function() {
    var MENU_LOCATION = "#notification-menu";

    var reload = function() {
        CHS.Utils.Ajax.send({
            method: 'notification_menu',
            app: 'help',
            data: {
                
            }, 
            dataType: "HTML",
            type: "GET",
            success: function(resp){
                $(MENU_LOCATION).html(resp);
                $(".dropdown-toggle").dropdown();
            }
        });
        // Reload menu every 30 seconds
        setTimeout(reload, 30000);
    };

    var setup = function() {
        //setTimeout(reload, 30000);
    };

    return {
        setup:setup
    }
}());

CHS.AdminMenu = (function() {
    var SUBMISSIONS_SELECTOR = "#submissions-count";
    var HELP_QUEUE_SELECTOR = "#help-count";

    var reload = function() {
        CHS.Utils.Ajax.send({
            method: 'admin_menu',
            app: 'help',
            data: {
                
            }, 
            dataType: "JSON",
            type: "GET",
            success: function(resp){
                $(SUBMISSIONS_SELECTOR).html(resp.submissions);
                $(HELP_QUEUE_SELECTOR).html(resp.questions);
            }
        });
        setTimeout(reload, 30000);
    };

    var setup = function() {
        // Reload menu every 30 seconds
        //setTimeout(reload, 30000);
    };

    return {
        setup:setup
    }
}());