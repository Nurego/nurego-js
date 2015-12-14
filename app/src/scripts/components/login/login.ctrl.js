define(["backbone","text!loginHTML","absNuregoView","jquery"],function(bb,loginTmpl,absNuregoView,$Nurego){

		var loginViewCtrl = absNuregoView.extend({
		  tagName: "div",
		  className: "login",
		  template: _.template(loginTmpl),
		  events: {
		    "click .button":   "login"
		  },

			/** directive attributes params:
			//params['login-url'];
		  //params['redirect-url'];
			**/

		  initialize: function(model,customTmpl){
		  	//this.__super__.initialize.apply(this);
		  	if(customTmpl){
		  		this.template = _.template(customTmpl);
		  	}
				this.params = utils.URLToArray(window.location.href);

		  	this.model = model;
		    //this.listenToOnce(this.model, "change", this.render);
		  	// this.model.fetch({dataType:"jsonp",error:this.modelHttpErrorsHandler});
				this.render();
		  },
			//
		  login:function(e){
				var email = this.$el.find('input[name="email"]').val();;
				var pass = this.$el.find('input[name="password"]').val();;
				var postURL = this.params['login-url'];
				var redirectUrl = this.params['redirect-url'];
		  	$Nurego.post(postURL,{"email":email,"password":pass},function(res,status,xhr){
		  		if(xhr.status == 200){
				  		if(redirectUrl.indexOf('http') == -1){
							window.top.location.href = parent + redirectUrl;
				  		}else{
				  			window.top.location.href = redirectUrl;
				  		}
					}
		  	});
		  },

		  render: function(){
				this.model.set('urlParams',this.params);
		  	var html = this.template(this.model.attributes);
		    this.$el.html(	html );
		    return this;
		  }

		});

		return loginViewCtrl;
})
