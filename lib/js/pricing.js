var nr_callback = function(){};
(function() {

    var p = {};
    var timeout_func,
        container,
        b_loading,
        b_warning,
        b_error,
        b_empty;

    function nr_init () {

        //Extend params
        p = {
            api_key: '',
            element_id: false,
            theme: 'nr-default',
            css_url: '',
            select_url: '/?plan_id=',
            select_callback: false,
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
            data_url: 'https://am-staging.nurego.com/v1/offerings?api_key='
        };
        for (var key in nr_params) {
            if (p.hasOwnProperty(key)) {
                p[key] = nr_params[key];
            }
        }

        //Load CSS
        if (p.theme && p.css_url) {
            var head = document.getElementsByTagName('head')[0],
                link = document.createElement('link');
            link.setAttribute('href', p.css_url);
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            head.appendChild(link);
        }

        //Init container
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

        //Timeout
        timeout_func = setTimeout(function(){
            try {
                //Hide loading block
                b_loading.style.display = 'none';

                //Try to get from cache
                var data = nr_cache_get();
                if (data ) {
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
        scr.src = p.data_url //TODO document.location.protocol + '//..'
            + p.api_key
            + '&callback=nr_callback';
        var nr = document.getElementsByTagName('script')[0];
        nr.parentNode.insertBefore(scr, nr);
    }

    function nr_cache_get () {

        if(typeof(Storage) === 'undefined') {
            return false;
        }

        return JSON.parse(window.localStorage.getItem('nr_' + p.api_key));
    }

    function nr_cache_set (data) {

        if(typeof(Storage) === 'undefined') {
            return false;
        }

        return window.localStorage.setItem('nr_' + p.api_key, JSON.stringify(data));
    }

    function nr_prepareData (response) {

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

    function nr_draw (data) {

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
                var val  = p.label_feature_off;
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
            }
            else {
                item = document.createElement('span');
            }
            if (typeof p.select_callback == 'function') {
                item.setAttribute('data-id', plans[i].id);
                item.onclick = function(e) {
                    e.stopPropagation();
                    p.select_callback(this.getAttribute('data-id'));
                    return false;
                }
            }
            //item.appendChild(document.createTextNode(p.label_select));
            item.innerHTML = p.label_select;

            td.appendChild(item);
            tr.appendChild(td);
        }
        tableFoot.appendChild(tr);

        table.appendChild(tableHead);
        table.appendChild(tableBody);
        table.appendChild(tableFoot);

        container.appendChild(table);
    }

    function nr_error (e) {

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
        }
    }

    //JSONP Callback
    nr_callback = function (response) {
        try {
            clearTimeout(timeout_func);
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

    try {
        nr_init();
    } catch (e) {
        nr_error(e);
    }

})();
