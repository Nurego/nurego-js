define([
		"constants",
		"utils",
		"widgetFactory",
		"loginModel",
		"registrationModel",
		"priceListModel",
		"loginViewCtrl",
		"priceListViewCtrl",
		"registrationViewCtrl",
		"tosViewCtrl",
		"categoryViewCtrl",
		"plansSwitcherViewCtrl",
		"categoryModel",
		"singleItemCtrl",
		"singleItemModel",
		"tosModel",
		"tosStatusModel",
		"text!absNuregoCss",
		"jquery"
		],
	function(constants,utils,widgetFactory,loginModel,registrationModel,
			priceListModel,loginViewCtrl,priceListViewCtrl,registrationViewCtrl,
			tosViewCtrl,categoryViewCtrl,plansSwitcherViewCtrl,categoryModel,singleItemCtrl,singleItemModel,
			tosModel,tosStatusModel,absNuregoCss,$Nurego){
				var app,lib;
				app = {};
				lib = {
					constants:constants,
					utils:utils,
					widgetFactory:widgetFactory,
					components:{
						single_item:{
							view:singleItemCtrl,
							model:singleItemModel
						},
						login:{
							view:loginViewCtrl,
							model:loginModel
						},
						plans_switcher:{//empty model since data is coming from an attributes
							view:plansSwitcherViewCtrl,
							model:new Backbone.Model({})
						},
						price_list:{
							view:priceListViewCtrl,
							model:priceListModel
						},
						priceList:{//remove this node after we make sure no one is using this alias anymore.
							view:priceListViewCtrl,
							model:priceListModel
						},
						registration:{
							view:registrationViewCtrl,
							model:registrationModel
						},
						terms_of_service:{
							view:tosViewCtrl,
							model:tosModel
						},
						category:{
							view:categoryViewCtrl,
							model:categoryModel
						}
					}
				};

				app.init = function(opt){
					_.forEach(opt.components,function(v,k){
						lib.widgetFactory.build(k,v);
					})
				},

				app.initObserver = function(){
					// The node to be monitored
/*					var callback = function(e){
						var $nodes = $Nurego( e.target ); // jQuery set
					    	$nodes.each(function() {
					    		var $node = $Nurego( this );
					    		if($node.prop('tagName') === "NUREGO-WIDGET"){
					    			var comps = {};
									var widgetAttrs = {};
									_.each(this.attributes,function(node){
										if(node.nodeName != "style"){
											widgetAttrs[node.nodeName] = node.value;
										}
									});

									var comp = comps[ widgetAttrs.name ] = {};
									comp.element = this;
									comp.configParams = widgetAttrs;
									comp.configParams.urlParams = lib.utils.URLToArray(window.location.href);

									console.log(comps)
									app.init({components:comps});
					    		}
					    	});
					}

					document.addEventListener("DOMNodeInsertedIntoDocument", callback, true);*/

					var target = document;

					// Create an observer instance
					var observer = new MutationObserver(function( mutations ) {
					  mutations.forEach(function( mutation ) {
					  	var lookUpWidgets = function(){
				    		var $node = $Nurego( this );
				    		if($node.prop('tagName') === "NUREGO-WIDGET"){
				    			var comps = {};
								var widgetAttrs = {};
								_.each(this.attributes,function(node){
									if(node.nodeName != "style"){
										widgetAttrs[node.nodeName] = node.value;
									}
								});

								var comp = comps[ widgetAttrs.name ] = {};
								comp.element = this;
								comp.configParams = widgetAttrs;
								comp.configParams.urlParams = lib.utils.URLToArray(window.location.href);
								app.init({components:comps});
				    		}
					    }

					    var newNodes = mutation.addedNodes; // DOM NodeList
					    if( newNodes !== null ) { // If there are new nodes added
					    	var $nodes = $Nurego( newNodes ); // jQuery set
					    	var $childNodes = $Nurego($nodes).find('nurego-widget');
					    	$nodes.each(lookUpWidgets);
					    	$childNodes.each(lookUpWidgets);
					    }
					  });
					});

					// Configuration of the observer:
					var config = {
						attributes: true,
						childList: true,
						characterData: true,
						subtree:true
					};

					// Pass in the target node, as well as the observer options
					observer.observe(target, config);
				},

				app.resizeThisWidget = function(){
					var size = {
						h:$(document).height(),
						w:$(document).width()
					};
					window.parent.postMessage('resizeMe',size);
				},

				app.onWidgetLoadFinish = function(){
					//call parent frame to resize me.
					params = lib.utils.URLToArray(window.location.href);
					var stretch = (params.stretch) ? true : (params.stretch);
					if(stretch){
						app.resizeThisWidget();
					}
				},

				app.onWidgetLoaded = function(){
					var params,thisWidget,widgetModel,widgetView,callback;
					params = lib.utils.URLToArray(window.location.href);
					var draw = function(){
						thisWidget = lib.components[params.widget];
				    	widgetModel = new thisWidget.model({apiKey:params.apiKey});
				   		widgetView = new thisWidget.view(widgetModel).$el;
				    	$Nurego('body').append(widgetView);
				    	//widgetModel.fetch({dataType:"jsonp",success:callback});
					}

					var onHTML = function(e){
						var key = e.message ? "message" : "data";
		    			var htmlData = e[key];
		    			thisWidget = lib.components[params.widget];
				    	widgetModel = new thisWidget.model({apiKey:params.apiKey});
				    	widgetView = new thisWidget.view(widgetModel,htmlData).$el;
				    	$Nurego('body').append(widgetView);
				    	//callback()
				    	//widgetModel.fetch({dataType:"jsonp",success:callback});
					};

					var onExternalModelReady = function(e){
							var key = e.message ? "message" : "data";
							var data = e[key];
							try{
								var jsonData = JSON.parse(data);
								thisWidget = lib.components[params.widget];
								widgetModel = new thisWidget.model({offer:data.offer,sub:data.sub});
								widgetView = new thisWidget.view(widgetModel).$el;
								$Nurego('body').append(widgetView);
							}catch(e){

							}
					}

					//widget with html resource to load before drawing.
					if(params.model && params.model != "null"){
						utils.listen(onExternalModelReady);
					}
					if(params.html && params.html != "null"){
						utils.listen(onHTML);
					}else{//go ahead and draw the widget
						draw();
					}
				}

				$Nurego(document).ready(function(){
					var elems = $Nurego("nurego-widget");
					var styleEl = document.createElement('style');
					styleEl.innerHTML = absNuregoCss;
					document.body.appendChild(styleEl);

					if(elems.length){
						var comps = {};
						for(var i = 0; i<elems.length; i++){
							var widgetAttrs = {};
							_.each(elems[i].attributes,function(node){
								if(node.nodeName != "style"){
									widgetAttrs[node.nodeName] = node.value;
								}
							});
							var comp = comps[ widgetAttrs.name ] = {};
							comp.element = elems[i];
							comp.configParams = widgetAttrs;
							comp.configParams.urlParams = lib.utils.URLToArray(window.location.href);
						}
						app.init({components:comps});
					}
					app.initObserver();
				});

				return app;
});
