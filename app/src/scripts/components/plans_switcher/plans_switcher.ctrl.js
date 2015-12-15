define(["backbone","text!plansSwitcherHTML","utils",
		"text!plansSwitcherCSS","absNuregoView","jquery"],
		function(bb,tmpl,utils,css,absNuregoView,$Nurego){
		var plansSwitcher = absNuregoView.extend({
		  tagName: "div",
		  className: "plansSwitcher",
		  template: _.template(tmpl),
		  events:{
				"click .selectPlan":   "select"
		  },

		  initialize: function(model,customTmpl){
		  	//this.__super__.initialize.apply(this);
		  	this.params = utils.URLToArray(window.location.href);

		    this.selectedPlan = "";
		  	this.model = model;
		  	this.model.set('offering',JSON.parse(this.params.offering));
		  	if(customTmpl){
		  		this.template = _.template(customTmpl);
		  	}
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

				this.render();
		  },

			select:function(e){
				var plan = $Nurego(e.target).attr('data-plan');
				var postURL = this.params.parent + this.params['post-url'];
				var redirectUrl = this.params['redirect-url'];
				var data = {"plan_id":plan};
				var obj = {"action":"post",
										"data":data,
										"url":postURL,
										"redirectUrl":redirectUrl};
				var frameMsg = JSON.stringify(obj);
				parent.postMessage(frameMsg,this.params.parent);
			},

		  addStyle:function(){
		  	var styleEl = document.createElement('style');
		  	styleEl.innerHTML = css;
		  	$Nurego('body').append(styleEl);
		  },

		  render: function(){
		  	var sso = utils.URLToArray(window.location.href)
		  	this.model.set('urlParams',this.params);
		  	console.log(this.model.attributes);
		  	var html = this.template(this.model.attributes);
		    this.$el.html(	html );
		    //this.bindEvents()
		    return this;
		  }

		});

		return plansSwitcher;
})
