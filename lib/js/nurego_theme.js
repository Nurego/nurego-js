/**
 * Closure
 */
(function () {
  var MULTIPLE_PRICES = 0,
      SINGLE_PRICE = 1;
  
  this.NuregoTheme = {};
  
  this.NuregoTheme.pricing_type = MULTIPLE_PRICES;
  
  this.NuregoTheme.setPricingType = function(type) {
    this.pricing_type = type;
  }
  
  this.NuregoTheme.loadCSS = function(url) {
    
  }
})();