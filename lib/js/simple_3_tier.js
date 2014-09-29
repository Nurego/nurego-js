(function () {
  this.Nurego.render = function(callback) {
    //Create main DOM elements
    container = document.createElement('div');
    if (Nurego.p.theme.name) {
        container.setAttribute('class', Nurego.p.theme.name);
    }

    //Check
    if(!Nurego.p.api_key) {
        throw "Api key is empty.";
    }
    
    $.get(NuregoUtils.getHtmlUrl(Nurego.p.theme.name), function(html) {
      try {
        //Hide loading block
        b_loading.style.display = 'none';

        //Try to get from cache
        var data = NuregoUtils.nr_cache_get();
        if (data) {
            nr_draw(html, data);
        }
        else {
            b_warning.appendChild(document.createTextNode('Pricing plans is currently not available.'));
            b_warning.style.display = '';
            b_empty.style.display = '';
        }
      } catch (e) {
          NuregoUtils.nr_error(e);
      }

      callback();
      
      // attach event handlers
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
          window.location = Nurego.p.signup_url + "?plan_eid=" + plan_eid;
        }
        
        e.preventDefault();
        return false;
      });
      
      $('.nr-go-update').on('click', function(e) {
        var plan_eid = $('.nr-plan-selected').data("external-id");
        if (!plan_eid) {
          alert('Please Select a Plan');
        } else {
          window.location = Nurego.p.update_url + "?plan_eid=" + plan_eid;
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
              remote: Nurego.p.nurego_url + "/cors/"
          }, {
              remote: {
                  request: {} // request is exposed by /cors/
              }
          });
        
          xhr.request({
              url: "/v1/registrations/?api_key=" + Nurego.p.api_key,
              method: "POST",
              data: { email: email, plan_eid: $('.nr-plan-selected').data("external-id") }
          }, function(response) {
              var reg_id = JSON.parse(response.data)["id"];
              xhr.request({
                  url: "/v1/registrations/" + reg_id + "/complete?api_key=" + Nurego.p.api_key,
                  method: "POST",
                  data: { password: "hello" }
              }, function(response) {
              })
          });
        }
        
        e.preventDefault();
        return false;
      })
    });
  }
  
  function nr_draw(html, data) {
      var pricingTable = $(html);

      var features = data.features;
      var plans = data.plans;
      var i, j, k, tr, td, th, a, span, item;

      //Print plans
      tr = document.createElement('tr');
      th = document.createElement('th');
      tr.appendChild(th);
      
      var thead_tr = pricingTable.find("thead tr");
      var plan_name_template = thead_tr.find("td.nr-plan-name");
      for (i = 0; i < plans.length; i++) {
          var td_plan_name = plan_name_template.clone();
          td_plan_name.html(plans[i].name);
          td_plan_name.show();
          thead_tr.append(td_plan_name);
      }

      //Print prices
      var tbody_price_tr = pricingTable.find("tbody tr.nr-price-row");
      var price_template = tbody_price_tr.find("td.nr-price");
      for (i = 0; i < plans.length; i++) {
          var td_price = price_template.clone();
          td_price.html(Nurego.p.label_before_price + plans[i].price + Nurego.p.label_after_price);
          td_price.show();
          tbody_price_tr.append(td_price);
      }

      //Print features
      var featureTemplate = pricingTable.find("tbody tr.nr-feature");
      for (i = 0; i < features.length; i++) {
          var trFeature = featureTemplate.clone();
          trFeature.find(".nr-feature-title").html(features[i]);
          for (j = 0; j < plans.length; j++) {
              var td = $("<td></td>");
              var val = Nurego.p.label_feature_off;
              for (k = 0; k < plans[j].features.length; k++) {
                  if (plans[j].features[k].name == features[i]) {
                      val = plans[j].features[k].value;
                  }
              }
              td.html(val);
              trFeature.append(td);
          }
          trFeature.show();
          pricingTable.find("tbody").append(trFeature);
      }

      //Print links
      var tfoot = pricingTable.find("tfoot tr.nr-select-row");
      var linkCellTemplate = tfoot.find(".nr-select-cell");
      for (i = 0; i < plans.length; i++) {
          var td = linkCellTemplate.clone();

          if (Nurego.p.select_url) {
              td.find(".nr-plan-select").attr("href", Nurego.p.select_url + plans[i].id);
              td.find(".nr-plan-select").attr("class", "nr-plan-select");
              td.find(".nr-plan-select").attr("data-id", plans[i].id);
              td.find(".nr-plan-select").attr("data-external-id", plans[i].external_id);
          }
          
          td.show();
          
          tfoot.append(td);
      }
      
      //Print trials
      var trial_tr = pricingTable.find("tfoot tr.nr-trial");
      for (i = 0; i < plans.length; i++) {
          if (plans[i].discounts.length > 0) {
            var td = $('<td></td>');
            td.attr("class", "nr-discount");
            td.html("<span class='nr-trial-days'>" +
                            (plans[i].discounts[0].discount.days_to_apply) +
                            "-day</span><br>free " +
                            (plans[i].discounts[0].discount.discount_type));
            trial_tr.append(td);
          } else {
            var th = $('<th></th>');
            trial_tr.append(th);
          }
      }

      container.appendChild(pricingTable[0]);

      // append signup button
      signup_div = document.createElement('div');
      signup_div.setAttribute('class', 'nr-signup-div');
      signup = document.createElement('a');
      signup.setAttribute('href', '#');
      
      if (Nurego.p.signup_url) {
          signup.setAttribute('class', 'nr-go-signup');
          signup.innerHTML = "Go Sign Up";
      } else if (Nurego.p.update_url) {
          signup.setAttribute('class', 'nr-go-update');
          signup.innerHTML = "Update";
      } else {
          signup.setAttribute('class', 'nr-signup');
          signup.innerHTML = "Sign Up";
      }
      
      signup_div.appendChild(signup);
      container.appendChild(signup_div);
  }
})();