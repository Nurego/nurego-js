define(["backbone","text!tosHTML","utils",
"text!termsOfServiceCSS",
"tosStatusModel","tosModel","absNuregoView","jquery"],
function(bb,tmpl,utils,css,tosStatusModel,tosModel,absNuregoView,$Nurego){

	var activation = absNuregoView.extend({
		tagName: "div",
		className: "terms_of_service",
		template: _.template(tmpl),
		events: {
			"click .acceptTerms": "acceptTerms"
		},

		initialize: function(model,customTmpl){
			//this.__super__.initialize.apply(this);
			this.params = utils.URLToArray(window.location.href);

			this.orgID = (this.params['org-id'] || this.params['orgId'] || this.params['orgID']);
			this.userID = (this.params['user-id'] || this.params['userId'] || this.params['userID']);
			// constants.setUserId(this.userID);

			if(customTmpl){
				this.template = _.template(customTmpl);
			}

			if(this.params['preRegistration'] === "true" || this.params['pre-registration'] === "true"){
				this.model = model;
			}else{
				this.model = new tosStatusModel();
			}

			this.listenToOnce(this.model, "change", this.render);
			this.model.fetch({
				dataType:"jsonp",
				error:_.bind(this.modelHttpErrorsHandler,this),
			});
			this.addStyle();
		},

		addStyle:function(){
			var styleEl = document.createElement('style');
			styleEl.innerHTML = css;
			$Nurego('body').append(styleEl);
		},

		redirect:function(){
			var redirectURL = this.params['redirect-url'];
			if(redirectURL.indexOf('http') !== -1){ //Doron: Absolute URL
				window.top.location.href = redirectURL;
			}else{ //Doron: Relative URL
				window.top.location.href = this.params.parent + redirectURL;
			}
		},

		acceptTerms:function(){
			//this.redirect(); //until the api works just redirect
			//return;
			var docs = this.model.get('legal_docs');

			var callback = function(data,req){
				this.docs.sent += 1;
				if(this.docs.sent >= this.docs.total){
					this.redirect();
				}
			};

			this.docs = {
				total:docs.data.length,
				sent:0
			};

			for(var i = 0; i <docs.data.length; i++){
				var doc_id = docs.data[i].id;
				//POST /v1/legaldocs/accept?api_key=l22085b6-7062-4b57-8869-cccb2f66f6fb&doc_id=leg_0b06-d678-4675-bd16-efd4f60f2b47

				var url = constants.nuregoApiUrl() + '/organizations/' + this.orgID + '/users/' + this.userID + '/legaldocs/' + doc_id + '/accept?api_key=' + constants.getNuregoApiKey();
				$Nurego.ajax({
					url:url,
					type:"post",
					//async:false, //firefox dont like async
					xhrFields:{
						withCredentials: false
					},
					error:_.bind(this.genericHttpErrorsHandler,this),
					crossDomain: true,
					dataType: 'json',
					contentType: "application/x-www-form-urlencoded",
					//data:"plan_id=" + params.plan_id + "&email=" + params.email,
					//data: { plan_id: params.plan_id, email:params.email},
					success:_.bind(callback,this)
				})
			}
		},

		render: function(){
			var legalDocs =  this.model.get('legal_docs');
			if(legalDocs){
				if(	_.isEmpty(this.model.toJSON()) || legalDocs.count === 0){
					this.redirect(); // redirect cause there are no terms to show
					return;
				}
			}
			var html = this.template(this.model.toJSON());
			this.$el.html(	html );
			return this;
		}

	});

	return activation;
})
