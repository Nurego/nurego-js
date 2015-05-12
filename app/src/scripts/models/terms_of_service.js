define(["backbone","constants"],function(Backbone,constants){
	
    var tos = Backbone.Model.extend({
        initialize:function(){
        },
         
        url:function(){
            var str = constants.nuregoApiUrl() + "/legaldocs/";
            var apiKey = constants.getNuregoApiKey();
            if(apiKey !== "false"){
                str += "?api_key=" + apiKey;
            }
        	return str;
        },
    });

    return tos;

});