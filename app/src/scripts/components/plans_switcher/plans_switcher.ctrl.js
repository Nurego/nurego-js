define(["backbone","text!plansSwitcherHTML","utils",
		"text!plansSwitcherCSS","tosModel",
		"absNuregoView","jquery"],
		function(bb,tmpl,utils,css,tosModel,absNuregoView,$Nurego){
		var plansSwitcher = absNuregoView.extend({
		  tagName: "div",
		  className: "plansSwitcher",
		  template: _.template(tmpl),
		  events:{
		  },

		  initialize: function(model,customTmpl){
		  	//this.__super__.initialize.apply(this);
		  	this.params = utils.URLToArray(window.location.href);
		  	if(!this.params.preview){
		  		this.tosModel = new tosModel();
		    	this.tosModel.fetch({dataType:"jsonp"});
		  	}

		    this.selectedPlan = "";
		  	this.model = model;
		  	if(customTmpl){
		  		this.template = _.template(customTmpl);
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


		  addStyle:function(){
		  	var styleEl = document.createElement('style');
		  	styleEl.innerHTML = css;
		  	$Nurego('body').append(styleEl);
		  },

		  render: function(){
		  	var sso = utils.URLToArray(window.location.href).sso;
		  	this.model.set('urlParams',this.params);
		  	console.log(this.model.attributes);
		  	var html = this.template(this.model.attributes);
		    this.$el.html(	html );
		    //this.bindEvents()
		    if(sso && sso === "false"){
		    	this.$el.addClass('noSSO');
		    }
		    return this;
		  }

		});

		return plansSwitcher;
})
