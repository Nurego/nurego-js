define(["backbone","constants"],function(Backbone,constants){

  var tosStatus = Backbone.Model.extend({
    initialize:function(opt){
      this.opt = opt;
      this.params = utils.URLToArray(window.location.href);
    },

    url:function(){
      var str = constants.nuregoApiUrl() + '/organizations/' + (this.params['org-id'] || this.params['orgId'] || this.params['orgID']) + '/users/' + (this.params['user-id'] || this.params['userId'] || this.params['userID']) + '/legaldocs/status';
      var apiKey = constants.getNuregoApiKey();
      if(apiKey !== "false"){
        str += "?api_key=" + apiKey;
      }
      return str;
    },
  });

  return tosStatus;

});
