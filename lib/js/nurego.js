(function() { 
	        if (!window.jQuery) {
        	var jq = document.createElement('script'); 
			jq.type = 'text/javascript';
          	jq.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js';
          	document.getElementsByTagName('head')[0].appendChild(jq);
        }
});

	/* 
	 * Nurego constructor
	 */
	function Nurego(Api_key) {

		/*
		 * Set Default params
		 * @param {String} key
		 * @param {String|Array} value
		 */
		this.api_key = Api_key;
		this.element_id = null;
		this.theme = 'nr-default';
		this.css_url ='http://js.nurego.com/v1/lib/css/themes.css';
		this.select_url = '/?plan_id=';
		this.select_callback = null;
		this.label_price = 'Monthly cost';
		this.label_select = 'Select';
		this.label_feature_on = '<span class="nr-check nr-yes"></span>';
		this.label_feature_off = '<span class="nr-check nr-no"></span>';
		this.label_before_price = '$';
		this.label_after_price = '';
		this.time_out = 5 * 1000; //Milliseconds,
		this.loading_class = 'nr-container nr-loading';
		this.error_class = 'nr-notify nr-red';
		this.warning_class = 'nr-notify nr-yellow';
		this.empty_class = 'nr-container nr-empty';
		this.price_class = 'nr-price';
		this.data_url = 'https://api.nurego.com/v1/offerings?api_key=';
		this.nurego_url = 'https://api.nurego.com/v1';
		this.jquery_url = 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js';
		this.timeout_func;
		this.container;
		this.b_loading;
		this.b_warning;
		this.b_error;
		this.b_empty;

		/**
		 * Error handler
		 * @param {String} e
		 */
		Nurego.prototype.nr_error = function(e) {

		    if (typeof nr_debug !== 'undefined' && nr_debug === true) {
		        throw e;
		    }
		    else {
		        //Show error block
		        if (this.container) {
		            this.b_loading.style.display = 'none';
		            this.b_warning.style.display = 'none';
		            this.b_error.appendChild(document.createTextNode(e));
		            this.b_error.style.display = '';
		            this.b_empty.style.display = '';
		        }
		        throw e;
		    }
		};

	   /* 
		* Change Nurego object properties
		*/ 
		Nurego.prototype.setParam = function(key, value) {
		   console.log( key + ': ' + value);
		   if( this.hasOwnProperty(key)) {
		       this.key = value;
		   } else {
		       throw "Undefined parameter '" + key + "'.";
		   } 

		    return true;
		};


		/*
		 * Include CSS, jQuery and externals as well
		 * as handle initial DOM element creation
		 */
		Nurego.prototype.init = function() {

		 	/* 
			* Getting CSS elements 
			*/
			if (this.theme && this.css_url) {
				var head = document.getElementsByTagName('head')[0],
				    link = document.createElement('link');
				link.setAttribute('href', this.css_url);
				link.setAttribute('rel', 'stylesheet');
				link.setAttribute('type', 'text/css');
				head.appendChild(link);
			}

			this.container = document.createElement('div');
		
			if (this.theme) {
				this.container.setAttribute('class', this.theme);
			}

				this.b_loading = document.createElement('div');
				this.b_loading.setAttribute('class', this.loading_class);
				this.b_loading.style.display = 'none';

				this.b_warning = document.createElement('div');
				this.b_warning.setAttribute('class', this.warning_class);
				this.b_warning.style.display = 'none';

				this.b_error = document.createElement('div');
				this.b_error.setAttribute('class', this.error_class);
				this.b_error.style.display = 'none';

				this.b_empty = document.createElement('div');
				this.b_empty.setAttribute('class', this.empty_class);
				this.b_empty.style.display = 'none';

				this.container.appendChild(this.b_loading);
				this.container.appendChild(this.b_warning);
				this.container.appendChild(this.b_error);
				this.container.appendChild(this.b_empty);

		  		//Check if element exists
				if (this.element_id) {
				    var element = document.getElementById(this.element_id);
				    if (element) {
				        element.appendChild(this.container);
				    }
				    else {
				        document.body.appendChild(this.container);
				        throw "Element '#" + this.element_id + "' not found.";
				    }
				}
				else {
				    document.body.appendChild(this.container);
				}

				//Show loading block
				this.b_loading.style.display = '';

				//Check
				if(!this.api_key) {
				    throw "Api key is empty.";
				}
				/*
				 * Workaround to pass this to setTimeout() and still
				 * have the correct scope.
			 	 */
				var me = this;

				//Timeout
				this.timeout_func = setTimeout(function () {
					try {
					//Hide loading block
					me.b_loading.style.display = 'none';

					//Try to get from cache
					var data = me.nr_cache_get();
					if (data) {
				    	me.nr_draw(data);
					}
					else {
				    	me.b_warning.appendChild(document.createTextNode('Pricing plans is currently not available.'));
				    	me.b_warning.style.display = '';
				    	me.b_empty.style.display = '';
					}
				} catch (e) {
					console.log( e );
					me.nr_error(e);
				}
			}, this.time_out);
		};

		/*
		 * Timeout function to be called by setTimeout
		 * in Nurego.init(). 
		 */
		Nurego.prototype.nr_cache_get = function(api_key) {

		    //Check if browser supports HTML5 Web Storage
		    if (typeof(Storage) === 'undefined' || typeof(window['localStorage']) === 'undefined') {
		        return false;
		    }

		    return JSON.parse(window.localStorage.getItem('nr_' + api_key));
		}


		/**
		 * Set pricing data to cache (HTML5 Web Storage)
		 * @param {Array} data
		 */
		Nurego.prototype.nr_cache_set = function(api_key, data) {

		    //Check if browser supports HTML5 Web Storage
		    if (typeof(Storage) === 'undefined' || typeof(window['localStorage']) === 'undefined') {
		        return false;
		    }

		    return window.localStorage.setItem('nr_' + this.api_key, JSON.stringify(data));
		};
		/**
		 * Prepare raw data
		 * @param {Array} response
		 */
		Nurego.prototype.nr_prepareData = function(response) {

		    var raw_plans = response.plans.data;
		    var features = [];
		    var plans = [];

		    //Get all features
		    for (var i = 0; i < raw_plans.length; i++) {
		        var plan_features = raw_plans[i].features.data;
		        var tmp = {
		            name: raw_plans[i].name,
		            id: raw_plans[i].id,
		            price: 0,
		            features: []
		        };
		        for (j = 0; j < plan_features.length; j++) {
		            if (plan_features[j].element_type === 'recurring') {
		                tmp.price = parseFloat(plan_features[j].price);
		            }
		            else {
		                if (features.indexOf(plan_features[j].name) === -1) {
		                    features.push(plan_features[j].name);
		                }
		                tmp.features.push({
		                    name: plan_features[j].name,
		                    value: plan_features[j].max_unit ? plan_features[j].max_unit : this.label_feature_on
		                });
		            }
		        }
		        plans.push(tmp);
		    }

		    return {
		        features: features,
		        plans: plans
		    };
		}
		/**
		 * Create table via DOM
		 * @param {Array} data
		 */
		Nurego.prototype.nr_draw = function(data) {

		    var features = data.features;
		    var plans = data.plans;
		    var i, j, k, tr, td, th, a, span, item;
		    var table = document.createElement('table');
		    var tableBody = document.createElement('tbody');
		    var tableHead = document.createElement('thead');
		    var tableFoot = document.createElement('tfoot');

		    //Print plans
		    tr = document.createElement('tr');
		    th = document.createElement('th');
		    tr.appendChild(th);
		    for (i = 0; i < plans.length; i++) {
		        td = document.createElement('td');
		        td.appendChild(document.createTextNode(plans[i].name));
		        tr.appendChild(td);
		    }
		    tableHead.appendChild(tr);

		    //Print prices
		    tr = document.createElement('tr');
		    th = document.createElement('th');
		    th.innerHTML = this.label_price;
		    th.setAttribute('class', this.price_class);
		    tr.appendChild(th);
		    for (i = 0; i < plans.length; i++) {
		        td = document.createElement('td');
		        td.appendChild(document.createTextNode(plans[i].price));
		        td.innerHTML = this.label_before_price + td.innerHTML + this.label_after_price;
		        td.setAttribute('class', this.price_class);
		        tr.appendChild(td);
		    }
		    tableBody.appendChild(tr);

		    //Print features
		    for (i = 0; i < features.length; i++) {
		        tr = document.createElement('tr');
		        th = document.createElement('th');
		        th.appendChild(document.createTextNode(features[i]));
		        tr.appendChild(th);
		        for (j = 0; j < plans.length; j++) {
		            td = document.createElement('td');
		            var val = this.label_feature_off;
		            for (k = 0; k < plans[j].features.length; k++) {
		                if (plans[j].features[k].name == features[i]) {
		                    val = plans[j].features[k].value;
		                }
		            }
		            td.innerHTML = val; //document.createTextNode
		            tr.appendChild(td);
		        }
		        tableBody.appendChild(tr);
		    }

		    //Print links
		    tr = document.createElement('tr');
		    th = document.createElement('th');
		    tr.appendChild(th);
		    for (i = 0; i < plans.length; i++) {
		        td = document.createElement('td');

		        if (this.select_url) {
		            item = document.createElement('a');
		            item.setAttribute('href', this.select_url + plans[i].id);
		            item.setAttribute('class', 'nr-plan-select');
		            item.setAttribute('data-id', plans[i].id);
		        }
		        else {
		            item = document.createElement('span');
		        }
		        if (typeof this.select_callback == 'function') {
		            item.setAttribute('data-id', plans[i].id);
		            item.onclick = function (e) {
		                e.stopPropagation();
		                this.select_callback(this.getAttribute('data-id'));
		                return false;
		            }
		        }
		        item.innerHTML = this.label_select;

		        td.appendChild(item);
		        tr.appendChild(td);
		    }
		    tableFoot.appendChild(tr);

		    table.appendChild(tableHead);
		    table.appendChild(tableBody);
		    table.appendChild(tableFoot);

		    this.container.appendChild(table);
		    
		    // append signup button
		    signup_div = document.createElement('div');
		    signup_div.setAttribute('class', 'nr-signup-div');
		    signup = document.createElement('a');
		    signup.setAttribute('href', '#');
		    signup.setAttribute('class', 'nr-signup');
		    signup.innerHTML = "Sign Up";
		    signup_div.appendChild(signup);
		    this.container.appendChild(signup_div);
		    
		    // handle select event
		    $('.nr-plan-select').on('click', function(e) {
		      $('.nr-plan-selected').removeClass('nr-plan-selected');
		      
		      $(this).addClass('nr-plan-selected');
		      
		      e.preventDefault();
		      return false;
		    });
		    
		    // handle signup click
		    $('.nr-signup').on('click', function(e) {
		      // create new user in nurego

		      var email = "email+" + (new Date().getTime()) + "@example.com";
		      
		      if ($('.nr-plan-selected').data("id")) {
		        var reg_url = this.nurego_url + 'registrations/jsonp?api_key='
		            + this.api_key + "&email=" + encodeURIComponent(email)
		            + "&plan_id=" + $('.nr-plan-selected').data("id");
		      
		        $.ajax({
		            url: reg_url,
		            type: "GET",
		            dataType: 'jsonp',
		            success:function(json){
		                // complete registration
		                var complete_reg_url = this.nurego_url + 'registrations/' + json.id
		                    + '/jsonp_complete?api_key='
		                    + this.api_key + '&password=hello';
		                $.ajax({
		                    url: complete_reg_url,
		                    type: "GET",
		                    dataType: 'jsonp',
		                    success:function(json){
		                       alert('Sign Up Success');
		                    },
		                    error:function(e){
		                       console.log("Error");
		                       console.log(e);
		                    }
		                });
		            },
		            error:function(e){
		               console.log("Error");
		               console.log(e);
		            }
		        });
		      }
		      
		      e.preventDefault();
		      return false;
		    })
		}



		/**
		 * JSONP Callback
		 * @param {Array} response
		 */
		Nurego.prototype.nr_callback = function (response) {
			console.log( response );
				try {
			        clearTimeout(this.timeout_func);

			        //Check for API error
			        if (typeof response.error !== 'undefined' && response.error) {
			            throw response.error;
			        }
	
			        //Prepare and cache
			        var data = this.nr_prepareData(response);
			        if (data) {
			            this.nr_cache_set(data);
			        }
	
			        //Hide loading block
			        this.b_loading.style.display = 'none';

			        this.nr_draw(data);
			    } catch (e) {
					console.log( e );
			        this.nr_error(e);
			    }
			}.bind(this);	

		/*
		 * Make the AJAX call to get data
		 * Feed it a callback function and an error handling
		 * function.
		 */
		Nurego.prototype.get_offering = function(callback, error) {
			this.init();
			var data = $.ajax({
		    url: this.data_url + this.api_key + '&callback=?',
		    type: "GET",
		    dataType: "jsonp",
		    });

			data.done(callback);
			data.error(error);

		}

	};

	/** 
	 * All in one, auto get and display the pricing table
	 * Works if the default CSS/location is wanted.
	 */
	function fetchOffering(api_key) {
	
		var nurego_object = new Nurego(api_key);
			
		nurego_object.init();
		
		nurego_object.get_offering(nurego_object.nr_callback, nurego_object.nr_error);
	};
	






