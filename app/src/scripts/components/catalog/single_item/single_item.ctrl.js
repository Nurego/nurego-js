define(["backbone","text!singleItemHTML","utils",
		"text!categoryCSS",
		"singleItemModel","absNuregoView","jquery"],
		function(bb,tmpl,utils,css,singleItemModel,absNuregoView,$Nurego){


/*
        categoryViewCtrl: '../components/catalog/category/category.ctrl',
        categoryHTML: '../components/catalog/category/category.html',
        categoryModel: '../models/category',
*/
 
		var singleItem = absNuregoView.extend({
		  tagName: "div",
		  className: "single_item_view",
		  template: _.template(tmpl),
		  events: {
		    
		  },

		  initialize: function(model,customTmpl){
		  	//this.__super__.initialize.apply(this);
		  	this.params = utils.URLToArray(window.location.href);
		  	this.model = model; 
		  	
		  	if(customTmpl){
		  		this.template = _.template(customTmpl);
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
		  	window.top.location.href = this.params.parent + redirectURL;
		  },

		  render: function(){
		  	console.log(this.model.toJSON())
		  	var html = this.template(this.model.toJSON());
		    this.$el.html(	html );
		    return this;
		  }

		});

		return singleItem;
})