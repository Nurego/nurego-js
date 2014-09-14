/**
 * Closure
 */
(function () {
  var SIMPLE_3_TIER = 0,
      SINGLE_PRICE = 1;
  
  this.NuregoTheme = {};
  
  this.NuregoTheme.pricing_type = SIMPLE_3_TIER;
  
  this.NuregoTheme.setPricingType = function(type) {
    this.pricing_type = type;
  }
  
  this.NuregoTheme.loadCSS = function(url) {
    
  }
})();