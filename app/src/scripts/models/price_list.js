define(["backbone","constants"],function(Backbone,constants){
    /*var baseClass = Backbone.Model.extend({
        fetch:function(){
            this.name
        }
    })
    */
    var priceListModel = Backbone.Model.extend({
        initialize:function(opt){
            this.opt = opt;
            this.params = utils.URLToArray(window.location.href);
        },

        url:function(){
            //var key = this.attr.find('apiParams') // {param1:val1,params2:val2}
            var url = constants.nuregoApiUrl() + "/offerings?api_key=" + this.opt.apiKey;
            if(this.params['product-id']){
              url = constants.nuregoApiUrl() + "/services/"+this.params['product-id']+"?api_key=" + this.opt.apiKey;
            }
            /*for(val in key){
                url += "&" + key +"=" + val;
            }*/
            if(this.params['api-params']){
                var customApiParams = JSON.parse(this.params['api-params']);
                _.forEach(customApiParams,function(v,k){
                    url += "&"+k+"="+v;
                });
            }

            return url;
        },

        parse:function(data,req){

          function ReplaceNumberWithCommas(yourNumber) {
            //Seperates the components of the number
            var n= yourNumber.toString().split(".");
            //Comma-fies the first part
            n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            //Combines the two sections
            return n.join(".");
          }

          function parsePlanBasic(plans){
            for(var i = 0; i<plans.length;i++){

              //parse billling_period
              if(plans[i].subscription_cycle == "monthly"){
                plans[i].subscription_cycle = "Month"
              }
              if(plans[i].subscription_cycle == "daily"){
                plans[i].subscription_cycle = "Day"
              }
              if(plans[i].subscription_cycle == "yearly"){
                plans[i].subscription_cycle = "Year"
              }
              if(plans[i].subscription_cycle == "weekly"){
                plans[i].subscription_cycle = "Week"
              }

              //show 2 decimal places after the price
              //plans[i].price = plans[i].price.toFixed(2);

              //add commas to price
              plans[i].price = ReplaceNumberWithCommas(plans[i].price);

            }
            return plans;
          }

            function getOfferingFeatures(plans){
                    var allFtrsArr = [];
                    for(var i = 0; i<plans.length;i++){
                        var planFeaturesArr = plans[i].plan_elements ? plans[i].plan_elements.data : [];
                        for(var j = 0; j<planFeaturesArr.length; j++){
                            allFtrsArr.push({
                                id:plans[i].plan_elements.data[j].id,
                                name:plans[i].plan_elements.data[j].name
                            });
                        }
                    }

                    var groupedFtrs = _.groupBy(allFtrsArr,"id");
                    var uniqFtrs = [];
                    _.each(groupedFtrs,function(ftr){
                        var uFtr = _.uniq(ftr, function(item, key, a) {
                             return item.a;
                        });
                        if(uFtr[0].name != "recurring" && uFtr[0].name != "Stripe element"){
                            uniqFtrs.push(uFtr[0])
                        }
                    });
                    return uniqFtrs;
               }

            function offeringWithTrial(plans){
              var has_trial = false;
              for (var i = 0; plans.length < i; i++){
                if (plans[i].trial_period){
                  has_trial = true;
                  break;
                }
              }
              return has_trial;
            }

            function setPlansFeatureValues(plans){

              function getValueString(maxUnits, minUnits, value_string, uom, plan_type, plan_value, limit) {
                if((maxUnits && maxUnits !== 0) || limit){
                  if(value_string){
                    value_string += " up to " + (maxUnits || limit)  + " " + uom + "s";
                  }else{
                    value_string = "Up to " + (maxUnits || limit)  + " " + uom + "s";
                  }
                }else{
                    if(minUnits){
                      value_string += " from " + minUnits  +  " " + uom + "s";
                    }
                    if(maxUnits){
                      value_string += " - " + maxUnits +  " " + uom + "s";
                    }

                    if(price){
                      if(plan_type === "constant"){
                        value_string = plan_value;
                      }else{
                        if(minUnits){
                          value_string = price + " per " + uom + " from " + minUnits + " " + uom + "s";
                        }else{
                          value_string = price + " per " + uom;
                        }
                      }
                    }
                }
                return value_string;
              }

              for(var i = 0; i < plans.length; i++){
                var plan_elements = plans[i].plan_elements ? plans[i].plan_elements.data : [];
                for (var f in plan_elements){
                  var planElement = plan_elements[f];
                  if(planElement.rating.tiers){
                    for (var t in planElement.rating.tiers.data){
                      var tier = planElement.rating.tiers.data[t];
                      var maxUnits = tier.max_unit ? ReplaceNumberWithCommas(tier.max_unit) : tier.max_unit;
                      var minUnits = tier.min_unit ? ReplaceNumberWithCommas(tier.min_unit) : tier.min_unit;
                      var uom = planElement.rating.uom ? planElement.rating.uom.name : "Unit";
                      var price = ReplaceNumberWithCommas(tier.price.toFixed(2));
                      var value_string = price;

                      tier.value_string = getValueString(maxUnits, minUnits, value_string, uom, tier.type, tier.value);
                    }
                  }else{

                    var maxUnits = planElement.rating.max_unit ? ReplaceNumberWithCommas(planElement.rating.max_unit) : planElement.rating.max_unit;
                    var minUnits = planElement.rating.min_unit ? ReplaceNumberWithCommas(planElement.rating.min_unit) : planElement.rating.min_unit;
                    var uom = planElement.entitlements && planElement.entitlements.uom ? planElement.entitlements.uom.name : "Unit";
                    var price = planElement.rating.price ? ReplaceNumberWithCommas(planElement.rating.price.toFixed(2)) : undefined;
                    var value_string = price;
                    var limit = planElement.entitlements ? planElement.entitlements.limit : undefined;

                    if(planElement.entitlements && planElement.entitlements.value){
                      plan_elements[f].rating.value_string = planElement.entitlements.value;
                    }else{
                      plan_elements[f].rating.value_string = getValueString(maxUnits, minUnits, value_string, uom, tier.type, tier.value, limit);
                    }
                  }

                }
              }

              return plans;
            }

        	  function customParser(response) {
                //if we are showing a product offer or a general offer.
		            var raw_plans = (response.plans) ? response.plans.data : response.offerings.data[0].plans.data ;
                var offeringFeatures = getOfferingFeatures(raw_plans);
                var plansParsedBasic = parsePlanBasic(raw_plans);
                var withTrial = offeringWithTrial(plansParsedBasic);
                var plansWithFeaturesValues = setPlansFeatureValues(plansParsedBasic);

                var parsed = {
                   offering_description: response.description,
                   features: offeringFeatures,
                   plans: plansWithFeaturesValues,
                   discounts: withTrial
               };

               return  parsed;
		        }

		    var parsed = customParser(data);
		    return parsed;
        }

    });

    return priceListModel;

});
