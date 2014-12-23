(function () {
  this.Nurego.renderCustomerPlan = function(planData, callback) {
    var planClass = '.plan-' + planData.plans[0].name;
    if (Nurego.p.customer_plan_render === Nurego.customerPlan.PLAN_OFFERINGS) {
      // highlight plan in offerings
      $(planClass).css("background-color", "#f26522");
      $(planClass).css("color", "white");
    } else if (Nurego.p.customer_plan_render === Nurego.customerPlan.PLAN_ONLY) {
      // display plan
      container = document.createElement('div');
      if (Nurego.p.theme.name) {
          container.setAttribute('class', Nurego.p.theme.name);
      }
    
      $.get(NuregoUtils.getHtmlUrl(Nurego.p.theme.name), function(html) {
        try {
          nr_draw(html, planData);
        } catch (e) {
            NuregoUtils.nr_error(e);
        }

        callback();
      });
    }
  }
  
  this.Nurego.render = function(callback) {
    //Create main DOM elements
    container = document.createElement('div');
    if (Nurego.p.theme.name) {
        container.setAttribute('class', Nurego.p.theme.name);
    }
    
    $.get(NuregoUtils.getHtmlUrl(Nurego.p.theme.name), function(html) {
      try {
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
    Nurego.loadPlans(html, data, "monthly", false);

    // attach event handlers for switcher widget
    $(container).find('.on-offswitch-label').on('click', function(e) {
        $(this).parent().toggleClass('monthly-checked');
        if ($(this).parent().hasClass("monthly-checked")){
          $(".switch-yearly").css("color", "#6D6D6E");
          $(".switch-monthly").css("color", "#C59DD7");
          setTimeout(function (){ Nurego.loadPlans($(".simple_3_tier div").first(), data, "monthly", true); }, 500);
        }
        else {
          $(".switch-monthly").css("color", "#6D6D6E");
          $(".switch-yearly").css("color", "#C59DD7");
          setTimeout(function (){ Nurego.loadPlans($(".simple_3_tier div").first(), data, "yearly", true); }, 500);
        }
      
        e.preventDefault();
        return false;
    });

    // When clicking on Switcher Monthly text
    $(container).find('.switch-monthly').on('click', function(e) {
        if (!$(".on-offswitch").hasClass("monthly-checked")){
          $(".on-offswitch-label").click();
        }
    });

    // When clicking on Switcher Yearly text
    $(container).find('.switch-yearly').on('click', function(e) {
        if ($(".on-offswitch").hasClass("monthly-checked")){
          $(".on-offswitch-label").click();
        }
    });

    if (Nurego.p.signup_url) {
      // append signup button
      signup_div = document.createElement('div');
      signup_div.setAttribute('class', 'nr-signup-div');
      signup = document.createElement('a');
      signup.setAttribute('href', '#');

      if (Nurego.p.signup_url) {
          signup.setAttribute('class', 'nr-go-signup');
          signup.innerHTML = Nurego.p.sign_up_button_text;
      } else if (Nurego.p.update_url) {
          signup.setAttribute('class', 'nr-go-update');
          signup.innerHTML = "Update";
      } else {
          signup.setAttribute('class', 'nr-signup');
          signup.innerHTML = Nurego.p.sign_up_button_text;
      }

      signup_div.appendChild(signup);
      container.appendChild(signup_div);
    }

    container.appendChild($('<div class="nr-nurego-tag-line">Pricing Table Crafted by <a href="http://www.nurego.com">Nurego</a></div>')[0]);

  }



  this.Nurego.loadPlans = function loadPlans(html, data, period, switched){
    var pricingTable = $(html);

    var features = data.features;
    var plans = data.plans;

    var i, j, k;

    // Labels
    var thead_tr = pricingTable.find("thead tr");
    // Remove any previous price data
    $(thead_tr).find("td").filter(":gt(0)").remove();
    var plan_name_template = thead_tr.find("td.nr-plan-name");
    var cc_tr = pricingTable.find("tbody tr.nr-cc");
    // Remove any previous cc data
    $(cc_tr).find("td").remove();

    // Prices
    var tbody_price_tr = pricingTable.find("tbody tr.nr-price-row");
    // Remove any previous plan name data
    if (switched) $(tbody_price_tr).find("td").filter(":gt(0)").remove();

    var price_template = tbody_price_tr.find("td.nr-price");

    // Links
    var tfoot = pricingTable.find("tfoot tr.nr-select-row");
    // Remove any previous select plan data
    if (switched) {
      tfoot.find("td").filter(function() { return $(this).css("display") != "none" }).remove();
    }

    // Trials
    var trial_tr = pricingTable.find("tfoot tr.nr-trial");
    // Remove any previous trial data
    if (switched) {
      $(trial_tr).children().remove();
      $(trial_tr).append("<th></th>");
    }

    if (Nurego.p.select_url) {
      var linkCellTemplate = tfoot.find(".nr-select-cell");
    }
    else {
      tfoot.hide();
    }

    // Remove any previous feature data
    if (switched) pricingTable.find("tbody tr.nr-feature").filter(function() { return $(this).css("display") != "none" }).remove();



    for (i = 0; i < plans.length; i++) {
        // Skip plans with period other than monthly
        if (Nurego.p.display_switcher && plans[i].period != period) continue;

        // Print Labels
        var td_plan_name = plan_name_template.clone();
        td_plan_name.addClass('plan-' + plans[i].name);
        td_plan_name.html(plans[i].name);
        td_plan_name.show();
        plans[i].credit_card ? cc_tr.append('<td>' + Nurego.p.label_feature_on + '</td>') : cc_tr.append('<td>' + Nurego.p.label_feature_off + '</td>');
        cc_tr.show();
        thead_tr.append(td_plan_name);

        // Print prices
        var td_price = price_template.clone();
        td_price.addClass('plan-' + plans[i].name);
        if (parseFloat(plans[i].price) !== 0) {
          var plan_price = plans[i].price % 1 != 0 ? parseFloat(plans[i].price).toFixed(2) : parseFloat(plans[i].price).toFixed(0);
          td_price.html(Nurego.p.label_before_price + plan_price + Nurego.p.label_after_price +
          '<span class="nr-price-period"></span>');
        } else {
          td_price.html(Nurego.p.zero_price_simple_tier_alt);
          td_price.css('color', 'black');
        }
        td_price.show();
        tbody_price_tr.append(td_price);

        // Print links
        if (linkCellTemplate){
          var td = linkCellTemplate.clone();
          td.addClass('plan-' + plans[i].name);
          td.find(".nr-plan-select").attr("href", Nurego.p.select_url + plans[i].id);
          td.find(".nr-plan-select").attr("class", "nr-plan-select");
          td.find(".nr-plan-select").attr("data-id", plans[i].id);
          td.find(".nr-plan-select").attr("data-external-id", plans[i].external_id);

          td.show();
      
          tfoot.append(td);
        }

        // Print trials
        if (plans[i].discounts.length > 0) {
          var td = $('<td></td>');
          td.attr("class", "nr-discount");
          if (plans[i].discounts[0].discount.days_to_apply != null){
            td.html("<span class='nr-trial-days'>" + plans[i].discounts[0].discount.days_to_apply + "-day</span><br>");
          }
          td.append("free " + (plans[i].discounts[0].discount.discount_type));
          trial_tr.append(td);
        } else {
          var th = $('<th></th>');
          trial_tr.append(th);
        }
    }

    // Print features
    var featureTemplate = pricingTable.find("tbody tr.nr-feature");
    for (i = 0; i < features.length; i++) {
        var trFeature = featureTemplate.clone();
        trFeature.find(".nr-feature-title").html(features[i]);
        for (j = 0; j < plans.length; j++) {
          // Skip plans with period other than monthly
          if (Nurego.p.display_switcher && plans[j].period != period) continue;

          var td = $("<td></td>");
          td.addClass('plan-' + plans[j].name);
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

    // If we pressed the switcher button, make sure we place the 'powered by' text after the new content
    if (switched && Nurego.p.display_switcher)
      $(container).prepend(pricingTable[0]);
    else
      container.appendChild(pricingTable[0]);

    // Decide first time whether to show Switcher widget or not
    if (!switched && Nurego.p.display_switcher){
      $(container).find("div").first().prepend("<div class='switcher-full'><span class='switch-monthly'>MONTHLY</span>"
         + "<div class='on-offswitch monthly-checked'>"
         + "<input type='checkbox' name='onoffswitch' class='on-offswitch-checkbox' id='myonoffswitch' checked>"
         + "<label class='on-offswitch-label' for='myonoffswitch'>"
         + "<span class='on-offswitch-inner'></span>"
         + "<span class='on-offswitch-switch'></span>"
         + "</label>"
         + "</div>"
         + "<span class='switch-yearly'>YEARLY</span></div>");

      // Month/Year switcher logic
      var last_plan_period = ""
      for (i = 0; i < data.plans.length; i++) {
        // If there are at least 2 types of plans, we want to show switcher
        if (last_plan_period != "" && last_plan_period != data.plans[i].period) {
          switcher = $(container).find("div.on-offswitch");
          switcher.show();
          switcher.css("display", "inline-block");
          break;
        }
        else {
          last_plan_period = data.plans[i].period;
        }

      }
    }




  }

})();