define(["backbone","text!registrationHTML",
		"utils","text!registrationCSS",
		"absNuregoView","jquery"],function(bb,tmpl,utils,css,absNuregoView,$Nurego){
		var activation = absNuregoView.extend({
		  tagName: "div",
		  className: "activation",
		  template: _.template(tmpl),
		  events: {
		    "click .activate": "completeRegistration"
		  },

		  initialize: function(model,customTmpl){
		  	//this.__super__.initialize.apply(this);
		  	if(customTmpl){
		  		this.template = _.template(customTmpl);
		  	}
		  	this.addStyle();
		  	this.model = model;
		  	this.render();
		  	//this.listenToOnce(this.model, "change", this.render);
		  	//this.model.fetch({dataType:"jsonp"});
		  },

		  addStyle:function(){
		  	var styleEl = document.createElement('style');
		  	styleEl.innerHTML = css;
		  	$Nurego('body').append(styleEl);
		  },

		  passMatch:function(){
		  	var pass = this.$el.find('input.pass').val();
		  	var passConfirm = this.$el.find('input.passConfirm').val();
		  	return (pass === passConfirm);
		  },

		  completeRegistration:function(){
		  	//http://localhost:8090/registration/complete?registrationId=<regId>&email=<email>&password=<pass>
		  	if(!this.passMatch()){
		  		this.$el.find('.passError').addClass('show');
		  		return false;
		  	}
		  	var baseURL = constants.nuregoApiUrl();
		  	var email = this.$el.find('input.email').val();
		  	var pass = this.$el.find('input.pass').val();
		  	var params = utils.URLToArray(window.location.href);
		  	var url = params['registration-url'] + "?password=" + pass;
		  	
		  	if(typeof(params["registration-id"]) != "undefined"){
		  			url += "&" + 'registrationId=' + params["registration-id"];
		  	}
		  	
		  	if(email && email.indexOf("@") != -1){
		  		url += "&email=" + encodeURI(email); 
		  	}
		  	var apiParams = utils.URLToArray(window.location.href)['api-params']; //get params and chop the first '?' char;
		  	var customApiParams;
		  	try {
		  		customApiParams = JSON.parse(apiParams);
		  	}catch(e){
		  		customApiParams = JSON.parse('{"' + decodeURI(apiParams.substr(1,apiParams.length-2)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
		  	}

		  	 _.forEach(customApiParams,function(v,k){
                    url += "&"+k+"="+v;
            });

		  	window.top.location.href = params.parent + url;
		  },

		  render: function(){
		  	var html = this.template(utils.URLToArray(window.location.href));
		    this.$el.html(	html );
		    return this;
		  }

		});

		return activation;
})