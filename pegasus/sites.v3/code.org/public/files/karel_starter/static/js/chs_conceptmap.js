CHS.ConceptMap = {
    APP_NAME: 'learn',
    
    complete: function(info, callback) {

        if(!CHS.User.isLoggedIn()){
            return;
        }


        CHS.Utils.Ajax.send({
            method: 'complete',
            app: this.APP_NAME,
            data: {
                user_id: CHS.User.id,
                info: info
            }, 
            success: function(resp){
                if(resp.status == "ok"){
                     if (callback) {
                        callback(this);
                     }
                }
            }
        });

    },
};


