define(["backbone","constants"],function(Backbone,constants){
	
    var tosStatus = Backbone.Model.extend({
        initialize:function(){
        },
         
        url:function(){
            var str = constants.nuregoApiUrl() + "/legaldocs/status";
            var apiKey = constants.getNuregoApiKey();
                if(apiKey !== "false"){
                    str += "?api_key=" + apiKey;
                }
        	return str;
        },
    });

    return tosStatus;

});


