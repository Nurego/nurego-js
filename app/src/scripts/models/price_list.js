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

        	//return "https://api.nurego.com/v1/offerings?api_key=lc14de81-587e-49d8-ba0e-487498ae297a&callback=jQuery19108296897902619094_1424775818134&_=1424775818135";
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

            function joinTieredFeatures(plans){
                    for(var i = 0; i<plans.length;i++){

                      //parse billling_period
                      if(plans[i].billing_period == "monthly"){
                        plans[i].billing_period = "Month"
                      }
                      if(plans[i].billing_period == "daily"){
                        plans[i].billing_period = "Day"
                      }
                      if(plans[i].billing_period == "yearly"){
                        plans[i].billing_period = "Year"
                      }
                      if(plans[i].billing_period == "weekly"){
                        plans[i].billing_period = "Week"
                      }

                      plans[i].price = ReplaceNumberWithCommas(plans[i].price);

                        var featuresArr = plans[i].features.data;
                        var groupedFeatures = _.groupBy(featuresArr,'id');
                        if(groupedFeatures.id){
                            //recurring element not needed
                            delete groupedFeatures.id;
                        }
                        plans[i].features.grouped = groupedFeatures;
                    }
                    return plans;
                }

              function getOfferingFeatures(plans){
                    var allFtrsArr = [];
                    for(var i = 0; i<plans.length;i++){
                        var planFeaturesArr = plans[i].features.data;
                        for(var j = 0; j<planFeaturesArr.length; j++){
                            allFtrsArr.push({
                                id:plans[i].features.data[j].id,
                                name:plans[i].features.data[j].name
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

            function offeringGotDiscounts(plans){
              var ans = false;
              for (var i = 0; plans.length < i; i++){
                if (plans[i].discounts.data.length != 0){
                  ans = true;
                  break;
                }
              }
              return ans;
            }

            function setPlansFeatureValues(plans){
              for(var i = 0; i<plans.length;i++){
                  var featuresArr = plans[i].features.grouped;
                  for (ftr in featuresArr){
                      //ftr = "key-rfrs-sdfsdf-asfdfsa-key";
                      for (var j = 0; j<featuresArr[ftr].length; j++){
                        var maxUnits = featuresArr[ftr][j].max_unit;
                        var minUnits = featuresArr[ftr][j].min_unit;
                        var unit_of_measure_value = featuresArr[ftr][j].unit_of_measure_name;
                        var ftr_uom = (unit_of_measure_value) ? unit_of_measure_value : "units";
                        var price = featuresArr[ftr][j].price;
                        var value_string = price;

                        if(featuresArr[ftr][j].max_unit != 0){
                          value_string+= " up to " + maxUnits  + " " + ftr_uom;
                        }else{
                            value_string+= " from " + minUnits  +  " " + ftr_uom;
                            if(maxUnits){
                              value_string+= " - " + maxUnits +  " " + ftr_uom;
                            }

                            if(featuresArr[ftr][j].type == "constant"){
                              value_string = featuresArr[ftr][j].value;
                            }else{
                              value_string = price + " per " + ftr_uom;
                            }
                        }
                        featuresArr[ftr][j].value_string = value_string;
                      }
                  }
              }

              return plans;
            }

/*


                    {{ if(plans[plan].features.grouped[features[item].id][0].max_unit) { }}
                        {{if (plans[plan].features.grouped[features[item].id][0].element_type == 'overage')  { }}
                            {{	if(!obj.urlParams["show-feature-price"])	{	}}
                              ${{=plans[plan].features.grouped[features[item].id][0].price}} per unit
                              up to {{=plans[plan].features.grouped[features[item].id][0].max_unit}} units
                            {{	}else{	}}
                              up to {{=plans[plan].features.grouped[features[item].id][0].max_unit}} units
                            {{	}	}}
                        {{	}else{	}}
                            {{=plans[plan].features.grouped[features[item].id][0].max_unit}}
                        {{	}	}}
                    {{	}else{	}}

                        <!-- if feature is of type "constant / multi value feature"  -->
                        {{	if(plans[plan].features.grouped[features[item].id][0].type == "constant")	{	}}

                            {{=plans[plan].features.grouped[features[item].id][0].value}}

                        {{   }else {  }}

                            <!-- if feature has price per unit -->
                            {{	if(obj.urlParams["show-feature-price"] && plans[plan].features.grouped[features[item].id][0].price != 0)	{	}}
                                    ${{=plans[plan].features.grouped[features[item].id][0].price}} per unit
                            {{	} else {	}}
                            <!-- if feature is available with no units/constants/multi value / etc.. -->
      												<span class="nr-check nr-yes ion-checkmark-circled"></span>
                            {{   }   }}


                        {{   }   }}


                    {{   }  }}

*/


        	  function customParser(response) {
                //if we are showing a product offer or a general offer.
		            var raw_plans = (response.plans) ? response.plans.data : response.offerings.data[0].plans.data ;
                var offeringFeatures = getOfferingFeatures(raw_plans);
                var plansParsedTieredPlans = joinTieredFeatures(raw_plans);
                var gotDiscount = offeringGotDiscounts(plansParsedTieredPlans);
                var plansWithFeaturesValues = setPlansFeatureValues(plansParsedTieredPlans);


                var parsed = {
                   offering_description: response.description,
                   features: offeringFeatures,
                   plans: plansWithFeaturesValues,
                   discounts:gotDiscount
               };
                console.log(parsed)
	              return  parsed;
		    }

		    var parsed = customParser(data);
		    return parsed;
        }

    });

    return priceListModel;

});
