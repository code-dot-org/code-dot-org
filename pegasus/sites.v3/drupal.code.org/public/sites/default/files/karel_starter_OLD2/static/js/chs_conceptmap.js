CHS.ConceptMap = {
    APP_NAME: 'learn',
    
    complete: function(info, callback) {
        console.log("Starting complete function.");

        if(!CHS.User.isLoggedIn()){
            return;
        }

        console.log("INFO:" );
        console.log(info);

        CHS.Utils.Ajax.send({
            method: 'complete',
            app: this.APP_NAME,
            data: {
                user_id: CHS.User.id,
                info: info
            }, 
            success: function(resp){
                console.log("Complete function success.");
                if(resp.status == "ok"){
                     if (callback) {
                        console.log("Complete function calling callback.");
                        callback(this);
                     }
                }
            }
        });

        console.log("Completed complete function.");
    },
};


