/**
 * JSONP Callback (global scope)
 */
var nr_callback = function () {
};

var nr_offeringsCb = function(response) {
};

(function(){
    this.NuregoUtils = {};

    this.NuregoUtils.findScriptPath = function() {
      var sc = document.getElementsByTagName("script");

      for(idx = 0; idx < sc.length; idx++)
      {
        s = sc.item(idx);

        if(s.src && s.src.match(/nurego\.js$/))
        {
          return s.src;
        }
      }
  
      return '';
    }

    this.NuregoUtils.getLibPath = function(scriptPath) {
      return scriptPath.replace("js/nurego.js", "");
    }

    var libPath = this.NuregoUtils.getLibPath(this.NuregoUtils.findScriptPath());

    this.NuregoUtils.getCssUrl = function(theme_name) {
      return libPath + 'css/' + theme_name + '.css';
    }

    this.NuregoUtils.getHtmlUrl = function(theme_name) {
      return libPath + 'html/' + theme_name + '.html';
    }

    this.NuregoUtils.getJsUrl = function(theme_name) {
      return libPath + 'js/' + theme_name + '.js';
    }
    
    /**
     * Get pricing data from cache (HTML5 Web Storage)
     * @return {Array|Boolean}
     */
    this.NuregoUtils.nr_cache_get = function() {

        //Check if browser supports HTML5 Web Storage
        if (typeof(Storage) === 'undefined' || typeof(window['localStorage']) === 'undefined') {
            return false;
        }

        return JSON.parse(window.localStorage.getItem('nr_' + Nurego.p.api_key));
    }

    /**
     * Set pricing data to cache (HTML5 Web Storage)
     * @param {Array} data
     */
    this.NuregoUtils.nr_cache_set = function(data) {

        //Check if browser supports HTML5 Web Storage
        if (typeof(Storage) === 'undefined' || typeof(window['localStorage']) === 'undefined') {
            return false;
        }

        return window.localStorage.setItem('nr_' + Nurego.p.api_key, JSON.stringify(data));
    }

    /**
     * Error handler
     * @param {String} e
     */
    this.NuregoUtils.nr_error = function(e) {

        if (typeof nr_debug !== 'undefined' && nr_debug === true) {
            throw e;
        }
        else {
            //Show error block
            if (container) {
                b_loading.style.display = 'none';
                b_warning.style.display = 'none';
                b_error.appendChild(document.createTextNode(e));
                b_error.style.display = '';
                b_empty.style.display = '';
            }
            throw e;
        }
    }

})();

var timeout_func,
    container,
    b_loading,
    b_warning,
    b_error,
    b_empty;

/**
 * Closure
 */
(function () {
    /**
     * Public object
     */
    this.Nurego = {};
    
    this.Nurego.theme = {};
    this.Nurego.theme.SIMPLE_3_TIER = 'simple_3_tier';
    this.Nurego.theme.FLAT_RATE = 'flat_rate';
    this.Nurego.theme.CUSTOM_THEME = 'custom_theme';
    
    //Default params
    this.Nurego.p = {
        api_key: null,
        element_id: null,
        theme: {
          name: this.Nurego.theme.SIMPLE_3_TIER,
          properties: {}
        },
        css_url: this.NuregoUtils.getCssUrl(this.Nurego.theme.SIMPLE_3_TIER),
        select_url: '/?plan_eid=',
        select_callback: null,
        label_price: 'Monthly cost',
        label_select: 'Select',
        label_feature_on: '<span class="nr-check nr-yes"></span>',
        label_feature_off: '<span class="nr-check nr-no"></span>',
        label_before_price: '$',
        label_after_price: '',
        time_out: 5 * 1000, //Milliseconds,
        loading_class: 'nr-container nr-loading',
        error_class: 'nr-notify nr-red',
        warning_class: 'nr-notify nr-yellow',
        empty_class: 'nr-container nr-empty',
        price_class: 'nr-price',
        nurego_url: 'https://api.nurego.com/v1/',
        offerings_path: 'offerings?api_key=',
        signup_url: '',
        update_url: '',
        distribution_channel: ''
    };
    
    this.Nurego.getOfferingsPath = function() {
      return Nurego.p.nurego_url + Nurego.p.offerings_path;
    }
  
    this.Nurego.setThemeType = function(type) {
      Nurego.p.theme.name = type;
      Nurego.p.css_url = NuregoUtils.getCssUrl(type);
    }
  
    this.Nurego.loadCSS = function() {
      if (Nurego.p.css_url) {
          var head = document.getElementsByTagName('head')[0],
              link = document.createElement('link');
          link.setAttribute('href', Nurego.p.css_url);
          link.setAttribute('rel', 'stylesheet');
          link.setAttribute('type', 'text/css');
          head.appendChild(link);
      }
    }
    
    function htmlCb() {
      container.appendChild(b_loading);
      container.appendChild(b_warning);
      container.appendChild(b_error);
      container.appendChild(b_empty);
    
      //Check if element exist
      if (Nurego.p.element_id) {
          var element = document.getElementById(Nurego.p.element_id);
          if (element) {
              element.appendChild(container);
          }
          else {
              document.body.appendChild(container);
              throw "Element '#" + Nurego.p.element_id + "' not found.";
          }
      }
      else {
          document.body.appendChild(container);
      }
      
      //Hide loading block
      b_loading.style.display = 'none';
    }
    
    this.Nurego.internalLoadPricingTable = function() {
      //Load CSS styles
      this.loadCSS();
      
      b_loading = document.createElement('div');
      b_loading.setAttribute('class', Nurego.p.loading_class);
      b_loading.style.display = 'none';

      b_warning = document.createElement('div');
      b_warning.setAttribute('class', Nurego.p.warning_class);
      b_warning.style.display = 'none';

      b_error = document.createElement('div');
      b_error.setAttribute('class', Nurego.p.error_class);
      b_error.style.display = 'none';

      b_empty = document.createElement('div');
      b_empty.setAttribute('class', Nurego.p.empty_class);
      b_empty.style.display = 'none';
      
      //Show loading block
      b_loading.style.display = '';
      
      $.getScript(NuregoUtils.getJsUrl(Nurego.p.theme.name), function(js) {
        //Fetch pricing data
        var scr = document.createElement('script');
        scr.type = 'text/javascript';
        scr.async = true;
        scr.src = Nurego.getOfferingsPath() //TODO document.location.protocol + '//..'
            + Nurego.p.api_key
            + '&callback=nr_callback';
        if (Nurego.p.distribution_channel) {
          scr.src += '&distribution_channel=' + Nurego.p.distribution_channel;
        }
        var nr = document.getElementsByTagName('script')[0];
        nr.parentNode.insertBefore(scr, nr);
      });      
    }

    /**
     * set Param
     * @param {String} key
     * @param {String|Array} value
     */
    this.Nurego.setParam = function(key, value)
    {
        if (Nurego.p.hasOwnProperty(key)) {
            Nurego.p[key] = value;
        }
        else {
            throw "Undefined param '" + key + "'.";
        }

        return true;
    };

    /**
     * set Public Key
     * @param {String} api_key
     */

    this.Nurego.setApiKey = function(api_key)
    {
        this.setParam('api_key', api_key);
    };
    
    this.Nurego.loadPricingTable = function() {
        //Save initialization
        try {
            this.internalLoadPricingTable();
        } catch (e) {
            NuregoUtils.nr_error(e);
        }
    };
    
    this.Nurego.setSignupUrl = function(url) {
        this.setParam('signup_url', url);
    };
    
    this.Nurego.setUpdateUrl = function(url) {
        this.setParam('update_url', url);
    };
    
    this.Nurego.setDistributionChannel = function(channel) {
        this.setParam('distribution_channel', channel);
    }
    
    nr_offeringsCb = function(response) {
        //Prepare and cache
        var data = nr_prepareData(response);
        Nurego.theme.ocb(data);
    };
    
    this.Nurego.getOfferings = function(ocb) {
        try {
            //Fetch pricing data
            var scr = document.createElement('script');
            scr.type = 'text/javascript';
            scr.async = true;
            scr.src = Nurego.getOfferingsPath() //TODO document.location.protocol + '//..'
                + Nurego.p.api_key
                + '&callback=nr_offeringsCb';
            if (Nurego.p.distribution_channel) {
              scr.src += '&distribution_channel=' + Nurego.p.distribution_channel;
            }
            var nr = document.getElementsByTagName('script')[0];
            nr.parentNode.insertBefore(scr, nr);
            this.theme.ocb = ocb;
        } catch (e) {
            NuregoUtils.nr_error(e);
        }
    }

    /**
     * Prepare raw data
     * @param {Array} response
     */
    function nr_prepareData(response) {

        var raw_plans = response.plans.data;
        var features = [];
        var plans = [];

        //Get all features
        for (var i = 0; i < raw_plans.length; i++) {
            if (raw_plans[i].plan_status !== 'retired') {
                var plan_features = raw_plans[i].features.data;
                var tmp = {
                    name: raw_plans[i].name,
                    id: raw_plans[i].id,
                    external_id: raw_plans[i].external_id,
                    price: 0,
                    features: [],
                    discounts: raw_plans[i].discounts,
                    period: ""
                };
                for (j = 0; j < plan_features.length; j++) {
                    if (plan_features[j].element_type === 'recurring') {
                        tmp.price = parseFloat(plan_features[j].price).toFixed(2);
                        tmp.period = plan_features[j].period;
                    }
                    else {
                        if (features.indexOf(plan_features[j].name) === -1) {
                            features.push(plan_features[j].name);
                        }
                        tmp.features.push({
                            name: plan_features[j].name,
                            description: plan_features[j].name,
                            value: plan_features[j].max_unit ? plan_features[j].max_unit : Nurego.p.label_feature_on
                        });
                    }
                }
                plans.push(tmp);
            }
        }

        return {
            features: features,
            plans: plans
        };
    }

    /**
     * JSONP Callback
     * @param {Array} response
     */
    nr_callback = function (response) {
        try {
            clearTimeout(timeout_func);

            //Check for API error
            if (typeof response.error !== 'undefined' && response.error) {
                throw response.error;
            }

            //Prepare and cache
            var data = nr_prepareData(response);
            if (data) {
                NuregoUtils.nr_cache_set(data);
            }
            
            Nurego.render(htmlCb);
        } catch (e) {
            NuregoUtils.nr_error(e);
        }
    };
})();
