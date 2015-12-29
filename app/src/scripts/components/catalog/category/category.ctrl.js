define(["backbone","text!categoryHTML","utils",
		"text!categoryCSS",
		"categoryModel","absNuregoView","jquery"],
		function(bb,tmpl,utils,css,categoryModel,absNuregoView,$Nurego){


/*
        categoryViewCtrl: '../components/catalog/category/category.ctrl',
        categoryHTML: '../components/catalog/category/category.html',
        categoryModel: '../models/category',
*/

		var categoryView = absNuregoView.extend({
		  tagName: "div",
		  className: "category_view",
		  template: _.template(tmpl),
		  events: {
		    "click .singleItem":"showService",
		    "click .close_widget":"closeService"
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
		  	this.initStyle();
		    this.addStyle();
		  },

		  addStyle:function(){
		  	var styleEl = document.createElement('style');
		  	styleEl.innerHTML = css;
		  	$Nurego('body').append(styleEl);
		  },

		  showService:function(e){
		  	$Nurego("body").css({"overflow":"hidden"});
		  	this.selectedService = $Nurego(e.target).attr('data-id');
		  	if(!this.selectedService){
		  		this.selectedService = $Nurego(e.target).parents('.singleItem').attr('data-id');
		  	}
		  	var widget = document.createElement('nurego-widget');
		  	$Nurego(widget).attr({"name":"single_item","service_id":this.selectedService})
		  	$Nurego('.widget_holder').append(widget);
		  	this.$el.addClass('show_item');
				window.document.body.scrollTop = 0
		  },

		  closeService:function(){
		  	$Nurego("body").css({"overflow":"auto"});
			$Nurego('.widget_holder').html('');
			this.$el.removeClass('show_item');
		  },

		  render: function(){
		  	var html = this.template(this.model.toJSON());
		    this.$el.html(	html );
		    return this;
		  }

		});

		return categoryView;
})
