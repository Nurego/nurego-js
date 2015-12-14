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
				var postURL = this.params.parent + this.params['login-url'];
				var redirectUrl = this.params['redirect-url'];
				parent.postMessage("Hello",this.params.parent);

				$Nurego.ajax({
			  		url:postURL,
						data:{"email":email,"password":pass},
			  		type:"post",
			  		crossDomain: true,
				    dataType: 'json',
				    contentType: "application/x-www-form-urlencoded",
						error:_.bind(this.genericHttpErrorsHandler,this)
				  	}).always(function(xhr,status){
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
