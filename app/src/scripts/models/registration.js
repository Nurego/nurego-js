define(["backbone","constants"],function(Backbone,constants){
	
    var registrationModel = Backbone.Model.extend({
        initialize:function(){
        },

        url:function(){
        	return constants.nuregoApiUrl() + "/registrations/url/login_url?api_key=" + constants.getNuregoApiKey();
        },

        defaults: {
            user:{
                name:"john",
                last:"doe"
            }
        }
    });

    return registrationModel;

});