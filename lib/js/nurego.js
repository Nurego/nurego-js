/**
 * JSONP Callback (global scope)
 */
var nr_callback = function () {
};

var nr_offeringsCb = function(response) {
};

/**
 * Closure
 */
(function () {

    /**
     * Public object
     */
    this.Nurego = {};
    /**
     * set Param
     * @param {String} key
     * @param {String|Array} value
     */
    this.Nurego.setParam = function(key, value)
    {
        if (p.hasOwnProperty(key)) {
            p[key] = value;
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
            nr_init();
        } catch (e) {
            nr_error(e);
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
        Nurego.ocb(data);
    };
    
    this.Nurego.getOfferings = function(ocb) {
        try {
            //Fetch pricing data
            var scr = document.createElement('script');
            scr.type = 'text/javascript';
            scr.async = true;
            scr.src = p.offerings_url //TODO document.location.protocol + '//..'
                + p.api_key
                + '&callback=nr_offeringsCb';
            if (p.distribution_channel) {
              scr.src += '&distribution_channel=' + p.distribution_channel;
            }
            var nr = document.getElementsByTagName('script')[0];
            nr.parentNode.insertBefore(scr, nr);
            this.ocb = ocb;
        } catch (e) {
            nr_error(e);
        }
    }

    //Default params
    var p = {
        api_key: null,
        element_id: null,
        theme: 'nr-default',
        css_url: 'http://js.nurego.com/v1/lib/css/themes.css',
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
        nurego_url: 'https://am-staging.nurego.com/v1/',
        offerings_url: 'https://am-staging.nurego.com/v1/offerings?api_key=',
        jquery_url: 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js',
        signup_url: '',
        update_url: '',
        distribution_channel: ''
    };

    var timeout_func,
        container,
        b_loading,
        b_warning,
        b_error,
        b_empty;

    /**
     * Initialization
     */
    function nr_init() {

        //Load CSS styles
        if (p.theme && p.css_url) {
            var head = document.getElementsByTagName('head')[0],
                link = document.createElement('link');
            link.setAttribute('href', p.css_url);
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            head.appendChild(link);
        }
        
        //Load jquery
        if (!window.jQuery) {
          var jq = document.createElement('script'); jq.type = 'text/javascript';
          jq.src = p.jquery_url;
          document.getElementsByTagName('head')[0].appendChild(jq);
        }

        //Create main DOM elements
        container = document.createElement('div');
        if (p.theme) {
            container.setAttribute('class', p.theme);
        }

        b_loading = document.createElement('div');
        b_loading.setAttribute('class', p.loading_class);
        b_loading.style.display = 'none';

        b_warning = document.createElement('div');
        b_warning.setAttribute('class', p.warning_class);
        b_warning.style.display = 'none';

        b_error = document.createElement('div');
        b_error.setAttribute('class', p.error_class);
        b_error.style.display = 'none';

        b_empty = document.createElement('div');
        b_empty.setAttribute('class', p.empty_class);
        b_empty.style.display = 'none';

        container.appendChild(b_loading);
        container.appendChild(b_warning);
        container.appendChild(b_error);
        container.appendChild(b_empty);

        //Check if element exist
        if (p.element_id) {
            var element = document.getElementById(p.element_id);
            if (element) {
                element.appendChild(container);
            }
            else {
                document.body.appendChild(container);
                throw "Element '#" + p.element_id + "' not found.";
            }
        }
        else {
            document.body.appendChild(container);
        }

        //Show loading block
        b_loading.style.display = '';

        //Check
        if(!p.api_key) {
            throw "Api key is empty.";
        }

        //Timeout
        timeout_func = setTimeout(function () {
            try {
                //Hide loading block
                b_loading.style.display = 'none';

                //Try to get from cache
                var data = nr_cache_get();
                if (data) {
                    nr_draw(data);
                }
                else {
                    b_warning.appendChild(document.createTextNode('Pricing plans is currently not available.'));
                    b_warning.style.display = '';
                    b_empty.style.display = '';
                }
            } catch (e) {
                nr_error(e);
            }
        }, p.time_out);

        //Fetch pricing data
        var scr = document.createElement('script');
        scr.type = 'text/javascript';
        scr.async = true;
        scr.src = p.offerings_url //TODO document.location.protocol + '//..'
            + p.api_key
            + '&callback=nr_callback';
        if (p.distribution_channel) {
          scr.src += '&distribution_channel=' + p.distribution_channel;
        }
        var nr = document.getElementsByTagName('script')[0];
        nr.parentNode.insertBefore(scr, nr);
    }

    /**
     * Get pricing data from cache (HTML5 Web Storage)
     * @return {Array|Boolean}
     */
    function nr_cache_get() {

        //Check if browser supports HTML5 Web Storage
        if (typeof(Storage) === 'undefined' || typeof(window['localStorage']) === 'undefined') {
            return false;
        }

        return JSON.parse(window.localStorage.getItem('nr_' + p.api_key));
    }

    /**
     * Set pricing data to cache (HTML5 Web Storage)
     * @param {Array} data
     */
    function nr_cache_set(data) {

        //Check if browser supports HTML5 Web Storage
        if (typeof(Storage) === 'undefined' || typeof(window['localStorage']) === 'undefined') {
            return false;
        }

        return window.localStorage.setItem('nr_' + p.api_key, JSON.stringify(data));
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
            var plan_features = raw_plans[i].features.data;
            var tmp = {
                name: raw_plans[i].name,
                id: raw_plans[i].id,
                external_id: raw_plans[i].external_id,
                price: 0,
                features: [],
                discounts: raw_plans[i].discounts
            };
            for (j = 0; j < plan_features.length; j++) {
                if (plan_features[j].element_type === 'recurring') {
                    tmp.price = parseFloat(plan_features[j].price).toFixed(2);
                }
                else {
                    if (features.indexOf(plan_features[j].name) === -1) {
                        features.push(plan_features[j].name);
                    }
                    tmp.features.push({
                        name: plan_features[j].name,
                        value: plan_features[j].max_unit ? plan_features[j].max_unit : p.label_feature_on
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
    function nr_draw(data) {

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
        th.innerHTML = p.label_price;
        th.setAttribute('class', p.price_class);
        tr.appendChild(th);
        for (i = 0; i < plans.length; i++) {
            td = document.createElement('td');
            td.appendChild(document.createTextNode(plans[i].price));
            td.innerHTML = p.label_before_price + td.innerHTML + p.label_after_price;
            td.setAttribute('class', p.price_class);
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
                var val = p.label_feature_off;
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

            if (p.select_url) {
                item = document.createElement('a');
                item.setAttribute('href', p.select_url + plans[i].id);
                item.setAttribute('class', 'nr-plan-select');
                item.setAttribute('data-id', plans[i].id);
                item.setAttribute('data-external-id', plans[i].external_id);
            }
            else {
                item = document.createElement('span');
            }
            if (typeof p.select_callback == 'function') {
                item.setAttribute('data-id', plans[i].id);
                item.onclick = function (e) {
                    e.stopPropagation();
                    p.select_callback(this.getAttribute('data-id'));
                    return false;
                }
            }
            item.innerHTML = p.label_select;

            td.appendChild(item);
            tr.appendChild(td);
        }
        tableFoot.appendChild(tr);
        
        //Print trials
        tr = document.createElement('tr');
        th = document.createElement('th');
        tr.appendChild(th);
        for (i = 0; i < plans.length; i++) {
            if (plans[i].discounts.length > 0) {
              td = document.createElement('td');
              td.setAttribute("class", "nr-discount");
              td.innerHTML = "<span class='nr-trial-days'>" +
                              (plans[i].discounts[0].discount.days_to_apply) +
                              " days</span><br>free " +
                              (plans[i].discounts[0].discount.discount_type);
              tr.appendChild(td);
            } else {
              th = document.createElement('th');
              tr.appendChild(th);
            }
        }
        tableFoot.appendChild(tr);

        table.appendChild(tableHead);
        table.appendChild(tableBody);
        table.appendChild(tableFoot);

        container.appendChild(table);

        // append signup button
        signup_div = document.createElement('div');
        signup_div.setAttribute('class', 'nr-signup-div');
        signup = document.createElement('a');
        signup.setAttribute('href', '#');
        
        if (p.signup_url) {
            signup.setAttribute('class', 'nr-go-signup');
            signup.innerHTML = "Go Sign Up";
        } else if (p.update_url) {
            signup.setAttribute('class', 'nr-go-update');
            signup.innerHTML = "Update";
        } else {
            signup.setAttribute('class', 'nr-signup');
            signup.innerHTML = "Sign Up";
        }
        
        signup_div.appendChild(signup);
        container.appendChild(signup_div);
        
        // handle select event
        $('.nr-plan-select').on('click', function(e) {
          $('.nr-plan-selected').removeClass('nr-plan-selected');
          
          $(this).addClass('nr-plan-selected');
          
          e.preventDefault();
          return false;
        });
        
        $('.nr-go-signup').on('click', function(e) {
          var plan_eid = $('.nr-plan-selected').data("external-id");
          if (!plan_eid) {
            alert('Please Select a Plan');
          } else {
            window.location = p.signup_url + "?plan_eid=" + plan_eid;
          }
          
          e.preventDefault();
          return false;
        });
        
        $('.nr-go-update').on('click', function(e) {
          var plan_eid = $('.nr-plan-selected').data("external-id");
          if (!plan_eid) {
            alert('Please Select a Plan');
          } else {
            window.location = p.update_url + "?plan_eid=" + plan_eid;
          }
          
          e.preventDefault();
          return false;
        });
        
        // handle signup click
        $('.nr-signup').on('click', function(e) {
          var email = "email+" + (new Date().getTime()) + "@example.com";
          
          var plan_eid = $('.nr-plan-selected').data("external-id");
          if (!plan_eid) {
            alert('Please Select a Plan');
          } else {
            var xhr = new easyXDM.Rpc({
                remote: p.nurego_url + "/cors/"
            }, {
                remote: {
                    request: {} // request is exposed by /cors/
                }
            });
          
            xhr.request({
                url: "/v1/registrations/?api_key=" + p.api_key,
                method: "POST",
                data: { email: email, plan_eid: $('.nr-plan-selected').data("external-id") }
            }, function(response) {
                var reg_id = JSON.parse(response.data)["id"];
                xhr.request({
                    url: "/v1/registrations/" + reg_id + "/complete?api_key=" + p.api_key,
                    method: "POST",
                    data: { password: "hello" }
                }, function(response) {
                })
            });
          }
          
          e.preventDefault();
          return false;
        })
    }

    /**
     * Error handler
     * @param {String} e
     */
    function nr_error(e) {

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
                nr_cache_set(data);
            }

            //Hide loading block
            b_loading.style.display = 'none';

            nr_draw(data);
        } catch (e) {
            nr_error(e);
        }
    };
})();
