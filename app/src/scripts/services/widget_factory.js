define(["underscore","utils","constants","jquery"],function(_,utils,constants,$Nurego){

	var iframeListener = function(){
			// Create IE + others compatible event handler
		var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
		var eventer = window[eventMethod];
		var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

		// Listen to message from child window
		eventer(messageEvent,function(e) {
			console.log('parent received message!:',e.data); 

			var msg = JSON.parse(e.data);

			if(msg.action == "post"){
				$.post(msg.url,msg.data,function(a,status,xhr){
					if(status === "success"){
						window.location.href = msg.redirectUrl;
					}
				})
			};
			//
			// var data = {"email":email,"password":pass};
			// var obj = {"action":"post",
			// 						"data":data,
			// 						"url":postURL,
			// 						"redirectUrl":redirectUrl};

		},false);
	}();

	var widgetsFactory = {
		options:{
			widget:"",
			html:"",
			css:"",
			parentUrl:"",
			token:""
		},

		build:function(components,opt){
			this.createWidgetFrame(components,opt);
		},

		createWidgetFrame:function(component,opt){
			var compSrc = this.buildComponentUrl(component,opt);
			var iframe = document.createElement('iframe');
			iframe.src = compSrc;
			if(typeof(opt.configParams.uid) != "undefined"){
				iframe.id = opt.configParams.uid;
			}
			if(typeof(opt.configParams.fname) != "undefined"){
				iframe.name = opt.configParams.fname;
			}
			this.decorateIframe(iframe);
			$Nurego(opt.element).append(iframe);
		},

		decorateIframe:function(iframeEl){
			/*var style ={"width","100%"}
			{"height","100%"}
			{"height","100%"}
			{"display","block"}
			{"border","0px"}
			*/
			iframeEl.style.setProperty("width","100%");
			iframeEl.style.setProperty("height","100%");
			iframeEl.style.setProperty("display","block");
			iframeEl.style.setProperty("border","0px");
			iframeEl.seamless = 'seamless';

			var zisUtils = utils;
			var onWidgetLoad = function(e){
				var params = zisUtils.URLToArray(this.src);
				var iframe = this;

				var fn = function(data){//post html result to init widget with template;
					iframe.contentWindow.postMessage(data,"*");
				};

				if(params.html && params.html != "null"){
					$Nurego.get(params.html,fn);
				}
			};

			iframeEl.onload = onWidgetLoad;
			//TDB:  //iframe.onload(subscribe to js hub events)
		},

		buildComponentUrl:function(component,opt){
			var nuregoApiParam = constants.getNuregoApiKey();
			var res = constants.widgetsURL() + "?widget=" + component;
			res += "&apiKey=" + nuregoApiParam + "&apiBaseUrl=" + constants.nuregoApiUrl();
			res += "&parent=" + window.location.origin;
			var indx = 0;
			_.each(opt.configParams,function(val,key){

				if(key == "api-params"){

					if(val.indexOf('{') === -1){debugger;
						val = "{" +encodeURIComponent(val)+ "}";
						//if this api-param key is a json this will throw
					}
				}

				if(key !== "urlParams"){
					var seperator = "&"; //(indx === 0) ? "?" : "&";
						res += seperator + key + "=" + val;
					indx++;
				}
			})

			_.each(opt.configParams.urlParams,function(val,key){
				if(key !== "name" && key !== "widget" && key !== "html"){
					var seperator = "&"; //(indx === 0) ? "?" : "&";
					res += seperator + key + "=" + val;
				}
				indx++;
			})

			return res;
		}
	}
	return widgetsFactory;
})
