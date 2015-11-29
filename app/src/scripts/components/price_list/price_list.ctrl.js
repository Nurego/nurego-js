define(["backbone","text!priceListHTML","utils",
		"text!priceListCSS","tosModel",
		"absNuregoView","text!priceListSingleTierHTML","jquery"],
		function(bb,tmpl,utils,css,tosModel,absNuregoView,priceListSingleTierHTML,$Nurego){
		var priceList = absNuregoView.extend({
		  tagName: "div",
		  className: "login",
		  template: _.template(tmpl),
		  events:{
		    "click .plan-select":   "registration",
		    "click .terms":   "openTerms",
		    "click .postNoSSo" : "postRegistration"
		  }, 
 
		  initialize: function(model,customTmpl){
		  	//this.__super__.initialize.apply(this);
		  	this.params = utils.URLToArray(window.location.href);
		  	var themes = {
		  		singleTier:priceListSingleTierHTML,  //deprecated : need to remove camelCode and use camel_code;
		  		single_tier:priceListSingleTierHTML,
		  		multitier:tmpl
		  	};
		  	if(!this.params.preview){
		  		this.tosModel = new tosModel();
		    	this.tosModel.fetch({dataType:"jsonp"});
		  	}

		    this.selectedPlan = "";
		  	this.model = model;
		  	if(customTmpl){
		  		this.template = _.template(customTmpl);
		  	}else if(this.params.theme && themes[this.params.theme]){
		  		this.template = _.template(themes[this.params.theme])
		  	}
		    this.listenToOnce(this.model, "change", this.render);
		    this.model.fetch({
		    	dataType:"jsonp", 
		    	error:_.bind(this.modelHttpErrorsHandler,this)
		    	//error:function(a,b,c){debugger;}
		    	//complete:function(a,b,c){debugger;},
		    	/*statusCode:{
				    404: function() {
				      alert( "page not found" );
				    }
				}*/
		    }); 
		    this.initStyle();
		    this.addStyle();
		    $Nurego(document).ready(function(){
		    	//$Nurego('.tieredWrapper').unslider({autoplay: true});
		    	var initCarousel = function(carWrapper){
		    		var carWrapperEl = $Nurego(carWrapper);
		    		//initial active slider is first one
		    		carWrapperEl.find('li:first-child').addClass('active'); 
		    		var next = function(){
		    			var activeEl = carWrapperEl.find('.active');
		    			if(activeEl.next().length != 0){
		    				activeEl.removeClass('active');
		    				activeEl.next().addClass('active');
		    			}else{
		    				activeEl.removeClass('active');
							carWrapperEl.find('li:first-child').addClass('active');
		    			}
		    		}

		    		var back = function(){
			    		var activeEl = carWrapperEl.find('.active');
			    			if(activeEl.prev().length != 0){
			    				activeEl.removeClass('active');
			    				activeEl.prev().addClass('active');
			    			}else{
			    				activeEl.removeClass('active');
								carWrapperEl.find('li:last-child').addClass('active');
			    			}
			    	}

			    	carWrapperEl.find(".ion-arrow-left-b").on('click',back);
			    	carWrapperEl.find(".ion-arrow-right-b").on('click',next);

		    	}


		    	var tieredCells = $Nurego('.tieredWrapper');
		    	for (var i = 0; i<tieredCells.length; i++){
		    		initCarousel(tieredCells[i])
		    	}

		    })
		  },

		  openTerms:function(){
		  	var url = this.params['terms-of-service-url'];
		  	if(url.indexOf('http') == -1){//Doron: Absolute URL
		  		url = this.params.parent + url;//Doron: Relative URL
		  	}
		  	
		  	var flag = "pre_registration=true";
		  	
		  	if(url.indexOf("?") === -1){
		  		url += "?" + flag;
		  	}else{
		  		url += "&" + flag;
		  	};


		  	var win = window.open(url, '_blank');
  			win.focus();

		  },

		  addStyle:function(){
		  	var styleEl = document.createElement('style');
		  	styleEl.innerHTML = css;
		  	$Nurego('body').append(styleEl);
		  }, 
 
		  registerWithSSo:function(){
		  	this.$el.addClass('fillEmail');
		  },

		validateEmail:function (email){
		    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		    //var valid = (email.indexOf("@") != -1 && email.indexOf(".") != -1);
		    //var re = /^@((?:[\w-]\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		    var valid = false;
		    if(email.indexOf('+') != -1){
		    	valid = re.test("a" +	email.substr(email.indexOf("@"))	);	
		    }else{
		    	valid = re.test(	email	);	
		    }
		    
		    //if(!re.test(email)) {
		    if(!valid){
		    	this.$el.find('.emailWrapper').addClass('has-error');
		    	return false;
		    }else{
		    	return true;
		    }
		    //return re.test(email);
		},

		  postRegistration:function(){
		  	this.hideErrors();
		  	var plan = this.selectedPlan;
		  	var baseURL = constants.nuregoApiUrl();
		  	var legal_doc_id = (this.tosModel) ? this.tosModel.get('id') : null; // need to get this from a model
		  	var email = this.$el.find('input.email').val()
		  	var params = {	
		  		plan_id:plan
		  	};

		  	var url = baseURL+'/registrations?api_key=' + constants.getNuregoApiKey()+ "&plan_id=" + plan;
		  	if(this.$el.hasClass('noSSO')){
		  		if(!this.validateEmail(email)){
		  			return false; //invalid email, stop here. 
		  		}
		  		url += "&email=" + encodeURIComponent(email); 
		  		params.email =  encodeURIComponent(email);
		  	}

		  	if(legal_doc_id){
		  		url += "&legal_doc_id=" + legal_doc_id;
		  	}
		  	//var data = "&plan_id=" + encodeURI(plan) + "&email=" + encodeURI(email);
		  	var zis = this;
		  	var parent = utils.URLToArray(window.location.href).parent;
		  	var callback = function(data,req){
		  		if(data.error){
		  			zis.errorMsgHandler(data);
		  		}
		  		var url,redirectUrl;
		  		redirectUrl = zis.params['redirect-url'];
		  		if(!redirectUrl){
		  			zis.$el.addClass('done');
		  			return;
		  		}
		  		url = redirectUrl;
		  		
		  		if(redirectUrl.indexOf("?") == -1){
		  			url += "?registrationId=" + data.id;
		  		}else{
		  			url += "&registrationId=" + data.id;
		  		};

		  		if(redirectUrl.indexOf('http') == -1){
					window.top.location.href = parent + url;
		  		}else{
		  			window.top.location.href = url;
		  		}
	  			//alert(JSON.stringify(data));
		  	};

		  	$Nurego.ajax({
		  		url:url,
		  		type:"post",
		  		crossDomain: true,
			    dataType: 'json', 
			    contentType: "application/x-www-form-urlencoded",
		  		//data:"plan_id=" + params.plan_id + "&email=" + params.email,
				//data: { plan_id: params.plan_id, email:params.email},
				error:_.bind(this.genericHttpErrorsHandler,this),
		  		success:callback
		  	})

		  },

		  registration:function(e){
		  	//https://BASEURL/v1/registrations?api_key=l1120591-dedd-406b-9319-5e3174fab10f
		  	//alert($(window.top).width())
		  	this.selectedPlan = $Nurego(e.target).attr('data-id');
		  	if(this.$el.hasClass('unchecked')){
		  		return;
		  	}
		  	if(this.$el.hasClass('noSSO') && !this.params.theme){
		  		this.registerWithSSo()
		  	}else{
			 	this.postRegistration();
		  	}
		  },

		  bindEvents:function(){
		  	var zis = this;
		  	$Nurego('#checkbox .termsCheckbox').click(function() {
			    var $this = $Nurego(this);
			    // $this will contain a reference to the checkbox   
			    if ($this.is(':checked')) {
			    	zis.$el.addClass('checked');
			    	zis.$el.removeClass('unchecked');
			        // the checkbox was checked 
			    } else {
			    	zis.$el.addClass('unchecked');
			    	zis.$el.removeClass('checked');
			    }
			});
		  },
		  render: function(){
		  	var sso = utils.URLToArray(window.location.href).sso;
		  	this.model.set('urlParams',this.params);
		  	console.log(this.model.attributes);
		  	var html = this.template(this.model.attributes);
		    this.$el.html(	html );
		    this.bindEvents()
		    if(sso && sso === "false"){
		    	this.$el.addClass('noSSO');
		    }
		    return this;
		  }

		});

		return priceList;
})