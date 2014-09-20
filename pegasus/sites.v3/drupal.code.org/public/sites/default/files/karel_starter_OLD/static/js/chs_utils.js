/* Provide a general utilities object to be used throughout the site. */
CHS.Utils = {
    // A list of functions to call on document ready
    readyHooks: [],
 
    // Add a ready hook
    addReadyHook: function(callback){
        this.readyHooks.push(callback);
    },
    
    // When the document is loaded, this function is called
    // to call all of the callback fuctions
    activateReadyHooks: function(){
        for(var i = 0; i < this.readyHooks.length; i++){
            var fn = this.readyHooks[i];
            fn();
        }
    },
    
    // Return whether the parameter email is valid
    validEmail: function(email){
        if(email.length == 0) return false;
        var regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        return regex.test(email);
    },

    // Set button to disabled state and change its text
    disableButton: function(button) {
        $(button).attr('disabled', 'disabled');
        var loading_text = $(button).attr("data-loading-text");
        loading_text = loading_text == undefined ? "Loading..." : loading_text;
        $(button).html(loading_text);
    },

    // Remove button disabled state and change its text back
    enableButton: function(button) {
        $(button).removeAttr('disabled');
        var text = $(button).attr("data-text");
        $(button).html(text);
    },

    // In the editor view, switches to the given tab
    // Pass the tab name with the preceding #
    switchToTab: function(tab_name) {
        // Hide all tabs
        $("a[data-toggle='tab']").parent().removeClass("active");
        $(".tab-pane").removeClass("active");

        // open the given one
        $(tab_name).addClass("active");
        $("a[href='" + tab_name + "']").parent().addClass("active");
    }
};


/* So we can send ajax requests 
 * https://docs.djangoproject.com/en/dev/ref/contrib/csrf/#ref-contrib-csrf */
jQuery(document).ajaxSend(function(event, xhr, settings) {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
});

/* Provide an alert dialog */
CHS.Utils.alert = function(options){
    var data = {
       msg: options.message,
       header: "CodeHS",
       button: "Ok"
   };
   var alert = $('#alert-template').tmpl(data);
   alert.appendTo("body");
   $("#alert-modal").modal({
        "backdrop":"static"
   });
   $(".alert-close").on("click", function() {
        CHS.Utils.closeAlert(options);
   });

   $("body").keypress(function(e) {
        if (e.which != 13) return;
        CHS.Utils.closeAlert(options);
        $("body").off('keypress');
   });
   
}

CHS.Utils.closeAlert = function(options) {
    $("#alert-modal").modal('hide');
    $("#alert-modal").remove();
    if (options.close_callback) {
        options.close_callback();
    }
}

CHS.Utils.Ajax = {

    send: function(options){   
        console.log('send'); 
        var data = options.data;
        data.method = options.method;
        var url = '/' + options.app + '/ajax/' + options.method;
        console.log(url);
        var dataType = options.dataType != undefined ? options.dataType : "JSON";
        var type = options.type != undefined ? options.type : "POST";
        $.ajax({
           url: url,
           type: type,
           data: data,
           dataType: dataType,
           success: function(resp){
               options.success(resp);
           }
        });
    }
    
};

/*
 *  Stripe for Payments
 * ===============================
 * This sets up Stripe's javascript. You just need to call
 * CHS.Utils.Stripe.setup() in a Document Ready.
 *
 * Documentation/tutorial available at 
 * https://stripe.com/docs/tutorials/forms
 *
 * @author Zach Galant 8/7/2012
 */
CHS.Utils.Stripe = (function() {
    var self = this;

    var FORM = "#register-form";
    var SUBMIT_BUTTON = "#register-button";

    var clearErrors = function() {
        $(".card-number").parent().removeClass("error");
        $(".card-cvc").parent().removeClass("error");
        $(".card-expiry-month").parent().removeClass("error");
        $(".card-expiry-year").parent().removeClass("error");
    };

    var highlightErrors = function(error) {
        switch (error.param) {
                case "number":
                    $(".card-number").parent().addClass("error");
                    break;
                case "cvc":
                    $(".card-cvc").parent().addClass("error");
                    break;
                case "exp_month":
                    $(".card-expiry-month").parent().addClass("error");
                    break;
                case "exp_year":
                    $(".card-expiry-year").parent().addClass("error");
                    break;
            }
    }

    var stripeResponseHandler = function(status, response) {
        if (response.error) {
            $(SUBMIT_BUTTON).removeAttr("disabled");

            clearErrors();
            highlightErrors(response.error);
            
            console.log(response.error);
            $("#payment-errors").html(response.error.message);
        } else {
            var form$ = $(FORM);
            var token = response['id'];

            // insert the stripe token into the form as a hidden field
            form$.append("<input type='hidden' name='stripeToken' value='" + token + "' />");
            form$.get(0).submit();
        }
    };

    var setupSubmit = function() {
        $(FORM).submit(function(event) {
            $(SUBMIT_BUTTON).attr("disabled", "disabled");

            Stripe.createToken({
                number: $('.card-number').val(),
                cvc: $('.card-cvc').val(),
                exp_month: $('.card-expiry-month').val(),
                exp_year: $('.card-expiry-year').val()
            }, stripeResponseHandler);

            // Don't submit here
            // It will submit in the callback fn
            return false;
        });
    };

    var setup = function() {
        setupSubmit();
    };

    return {
        setup: setup,
    }

}());


