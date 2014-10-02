(function () {
  this.Nurego.renderCustomerPlan = function(planData, callback) {
    $.get(NuregoUtils.getHtmlUrl(Nurego.p.theme.name), function(flatRateHTML) {
      var rateTable = $(flatRateHTML);
      Nurego.renderPlan(planData, rateTable);
      
      if (Nurego.p.customer_plan_render === Nurego.customerPlan.PLAN_ONLY) {
        container = rateTable[0];
      } else if (Nurego.p.customer_plan_render === Nurego.customerPlan.PLAN_OFFERINGS) {
        $(container).parent().prepend($('<div class="section-header">Available plan</div>'))
        $(container).parent().prepend(rateTable);
        $(container).parent().prepend($('<div class="section-header">Your current plan</div>'))
      }
      
      callback();
    });
  }
  
  this.Nurego.render = function(callback) {
    $.get(NuregoUtils.getHtmlUrl(Nurego.p.theme.name), function(flatRateHTML) {
      var rateTable = $(flatRateHTML);
  
      //Try to get from cache
      var data = NuregoUtils.nr_cache_get();
      if (data) {
        Nurego.renderPlan(data, rateTable);
      }
      
      container = rateTable[0];

      callback();

      if (Nurego.p.signup_url !== '') {
        $('#sign-up-button-div').show();
        $('#sign-up-button').on("click", function(e) {
          window.location = Nurego.p.signup_url;
          e.preventDefault();
          return false;
        });
      }
    });
  }
  
  this.Nurego.renderPlan = function(data, rateTable) {
    var features = data.features;
    var plans = data.plans;
    var i;

    if (parseFloat(plans[0].price) !== 0) {
      rateTable.find('.nr-price-info').html(plans[0].period);
      rateTable.find('.nr-price-value').html('$' + plans[0].price);
    } else {
      rateTable.find('.nr-price-info').html('');
      rateTable.find('.nr-price-value').html(Nurego.p.zero_price_alt);
      rateTable.find('.nr-price-value').css('font-size', '24px');
      rateTable.find('.nr-price-value').css('color', 'black');
      rateTable.find('.nr-price-value').css('font-weight', 'bold');
    }
    
    rateTable.find('.nr-title').html(plans[0].name);
    // null out description
    rateTable.find('.nr-description').html("");
    if (Nurego.p.plan_description) {
      rateTable.find('.nr-description').html(Nurego.p.plan_description);
    } else {
      rateTable.find('.nr-description').html(data.offering_description);
    }

    var feature_div = rateTable.find('.nr-feature-item');
    var feature_list = rateTable.find('.nr-ul');
    for (i = 0; i < plans[0].features.length; i++) {
      var f = plans[0].features[i];
      var feature_item = feature_div.clone();
      
      if (parseFloat(f.price) === 0) {
        feature_item.find('.nr-title').html(f.name);
        feature_item.find('.nr-feature-info').addClass('nr-feature-check');
        feature_item.find('.nr-feature-price').html('✓');
        feature_item.find('.nr-feature-price').css('margin-left', '-80px');
      } else {
        feature_item.find('.nr-title').html('per ' + f.unit_name);
        feature_item.find('.nr-feature-price').html(Nurego.p.label_before_price + f.price);
        feature_item.find('.nr-feature-price').html(Nurego.p.label_before_price + f.price);
      }

      feature_item.find('.nr-description').html(f.description);
      feature_item.show();
      feature_list.append(feature_item);
    }
    
    if (plans[0].discounts.length > 0) {
        rateTable.find('#trial-ribbon-text').html(plans[0].discounts[0].discount.days_to_apply +
          '-day free ' + plans[0].discounts[0].discount.discount_type);
        rateTable.find('#trial-ribbon').show();
    }
  }
})();