define(["backbone","constants"],function(Backbone,constants){

    var categoryMod = Backbone.Model.extend({
        initialize:function(opt){
            this.opt = opt;
            this.params = utils.URLToArray(window.location.href);
        },

        url:function(){
            //var str = constants.nuregoApiUrl() + "/legaldocs/";
            //var str = constants.nuregoApiUrl() + "/catalog";

            var str = constants.nuregoApiUrl() + "/services/"+this.params['service_id']+"?";

            //var str = "/src/scripts/mockdata/category.json";
            var apiKey = constants.getNuregoApiKey();
            if(apiKey !== "false"){
                str += "api_key=" + apiKey + "&";
            }
            if(this.params['api-params']){
                var customApiParams = JSON.parse(this.params['api-params']);
                _.forEach(customApiParams,function(v,k){
                    str += k+"="+v+"&";
                });
            }
        	return str;
        },
    });

    return categoryMod;

});
