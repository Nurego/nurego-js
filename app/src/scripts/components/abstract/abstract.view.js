define(["backbone","utils","text!absHTML"],function(bb,utils,absErrorTmpl){
		var absNuregoView = Backbone.View.extend({
		  initialize: function(model,customTmpl){
		  	this.showErrors = utils.URLToArray(window.location.href)['show-errors'];
		  	this.params = utils.URLToArray(window.location.href);
		  },  

		  initStyle:function(){
		  	if(this.params.css){
		  		//this.params.css
		  		var link = document.createElement('link');
				cssUrl = this.params.css;
				link.setAttribute('rel', 'stylesheet');
				link.setAttribute('type', 'text/css');
				if(this.params.css.indexOf('//') == -1){
					cssUrl = this.params.parent + "/" + this.params.css;
				}
				link.setAttribute('href',cssUrl );
				document.getElementsByTagName('head')[0].appendChild(link);
		  	}
		  },

		  hideErrors:function(){
				this.$el.find('.ajaxErrorMsg').hide();
		  },

		  renderWithError:function(){
		  	this.absTemplate = _.template(absErrorTmpl);
		  	this.$el.html(this.absTemplate());
		  	return this.$el;
		  },
		  errorMsgHandler:function(response){
			if(this.showErrors !== "false"){
					try{
						var el = this.$el.find('.ajaxErrorMsg');
						el.find('.txt').text(xhr.responseJSON.error.message);
						el.show();
				  	}catch(e){}
			}
		  },

		  modelHttpErrorsHandler:function(model,response,options){
			if(this.showErrors !== "false"){
				try{

					if(response.statusText === "error"){
						var el = this.renderWithError().find('.ajaxErrorMsg');
						el.find('.txt').text("There seems to be a problem, please check you are using a valid Nurego Key and try again");
					}
					el.show();
			  	}catch(e){}
			}
		  },

		  genericHttpErrorsHandler:function(xhr,textStatus,errorThrown){
		  	if(this.showErrors !== "false"){
				try{
					var el = this.$el.find('.ajaxErrorMsg');
					el.find('.txt').text(xhr.responseJSON.error.message);
					el.show();
			  	}catch(e){}
			}
		  }


		});
		return absNuregoView;
});
