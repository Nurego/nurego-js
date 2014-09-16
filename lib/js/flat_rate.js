(function () {
  this.Nurego.createFlatRate = function(callback) {
    $.get(NuregoUtils.getHtmlUrl(p.theme.name), function(flatRateHTML) {
      var rateTable = $(flatRateHTML);
  
      //Try to get from cache
      var data = NuregoUtils.nr_cache_get();
      if (data) {
          var features = data.features;
          var plans = data.plans;
          var i;
      
          rateTable.find('.nr-price-value').html('$' + plans[0].price);
          rateTable.find('.nr-title').html(plans[0].name);
          rateTable.find('.nr-description').html(plans[0].description);

          var feature_div = rateTable.find('.nr-feature-item');
          var feature_list = rateTable.find('.nr-ul');
          for (i = 0; i < plans[0].features.length; i++) {
            var f = plans[0].features[i];
            var feature_item = feature_div.clone();
            feature_item.find('.nr-title').html(f.name);

            feature_item.find('.nr-description').html(f.description);
            feature_item.show();
            feature_list.append(feature_item);
          }
      }
  
      container = rateTable[0];
    
      callback();
    });
  }
})();