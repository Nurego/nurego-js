define(['utils','jquery'],function(utils,$Nurego){
	return {
		jsBaseURL:function(){
			var baseUrlEl = $Nurego("nurego-js-baseurl").attr('url');
			if(baseUrlEl){
				return baseUrlEl;
			}else{
				//return "//rawgit.com/Nurego/nurego-js/staging/app/src"; 
				return "//rawgit.com/Nurego/nurego-js/production/app/src";
			}
		},

		getNuregoApiKey:function(){
			//return "l402b7a9-dc19-43fd-89cd-64e8fe101347";
			var apiKey = $Nurego("nurego-public-customer-id").attr('id');
			var apiKeyParam = utils.URLToArray(window.location.href).apiKey;
			if(apiKey){
				return apiKey;
			}
			if(apiKeyParam){
				return apiKeyParam;
			}else{
				return false;
			}
		},
		
		nuregoApiUrl:function(){
			var nuregoApi = $Nurego("nurego-api-baseurl").attr('url');
			var nuregoApiParam = utils.URLToArray(window.location.href).apiBaseUrl;
			if(nuregoApi){
				return nuregoApi;
			}
			if(nuregoApiParam){
				return nuregoApiParam;
			}
			else{//staging is the default
				return "https://am-staging.nurego.com/v1";
			}
		},

		widgetsURL:function(){
			var scriptSrc, nuregoScript,url;
			nuregoScript = $Nurego( "script[rel='nurego']" );
			if(nuregoScript){
				scriptSrc = nuregoScript.attr('src');
				if(scriptSrc.indexOf('staging')){
					url = "rawgit.com/Nurego/nurego-js/staging/app/src/widget.html";
				}
				if(scriptSrc.indexOf('master')){
					url = "rawgit.com/Nurego/nurego-js/master/app/src/widget.html";
				}
			}
			else{
				return this.jsBaseURL() + "/widget.html";
			}
		}
	};
})
 