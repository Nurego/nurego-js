define(['utils','jquery'],function(utils,$Nurego){
	return {
		jsBaseURL:function(){
			var scriptSrc, nuregoScript,url,stagingURL,masterURL,baseUrlEl,prodURL,prodVersion;
			
			//baseUrlEl = $Nurego("nurego-js-baseurl").attr('url');
			baseUrlEl = $Nurego( "meta[property='nrg:js-base-url']" ).attr('content');
			if(_.isUndefined(baseUrlEl)){
				baseUrlEl = $Nurego("nurego-js-baseurl").attr('url');
			}
			/*<meta property="nrg:js-base-url" url="nurego.com"/>*/

			if(!_.isUndefined(baseUrlEl)){
				return baseUrlEl;
			}else{
				nuregoScript = $Nurego( "script[rel='nurego']" );
				stagingURL = "//rawgit.com/Nurego/nurego-js/staging/app/src";
				masterURL = "//rawgit.com/Nurego/nurego-js/master/app/src";
				url = masterURL;
				
				if(nuregoScript && (typeof(nuregoScript) !== "undefined") && nuregoScript.length != 0 ){
					scriptSrc = nuregoScript.attr('src');
					if(scriptSrc.indexOf('js.nurego.com') !== -1){
				        version = scriptSrc.split('/')[3];
				        url = "//js.nurego.com/"+version;
					}
					if(scriptSrc.indexOf('staging') !== -1){
						url = stagingURL;
					}
				}

				return url;
			}
		},

		getNuregoApiKey:function(){
			//baseUrlEl = $Nurego("nurego-js-baseurl").attr('url');
			/*<meta property="nrg:nurego-public-customer-id" id="0000"/>*/
			//var apiKey = $Nurego("nurego-public-customer-id").attr('id');

			var apiKey = $Nurego( "meta[property='nrg:nurego-public-customer-id']" ).attr('content');
			if(_.isUndefined(apiKey)){
				apiKey = $Nurego("nurego-public-customer-id").attr('url');
			}

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

			/*<meta property="nrg:nurego-api-baseurl" url="staging.nurego.com/v1"/>*/
			//var apiKey = $Nurego("nurego-public-customer-id").attr('id');

			var nuregoApi = $Nurego("meta[property='nrg:nurego-api-baseurl']").attr('content');
			if(_.isUndefined(nuregoApi)){
				nuregoApi = $Nurego("nurego-api-baseurl").attr('url');
			}

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
			return this.jsBaseURL() + "/widget.html";
		}
	};
})
 