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


            function joinTieredFeatures(plans){
                    for(var i = 0; i<plans.length;i++){
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
                        if(uFtr[0].name != "recurring"){
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

        	  function customParser(response) {
                //if we are showing a product offer or a general offer.
		            var raw_plans = (response.plans) ? response.plans.data : response.offerings.data[0].plans.data ;
                var offeringFeatures = getOfferingFeatures(raw_plans);
                var plansParsedTieredPlans = joinTieredFeatures(raw_plans);
                var gotDiscount = offeringGotDiscounts(plansParsedTieredPlans);
		        return {
		            offering_description: response.description,
		            features: offeringFeatures,
		            plans: plansParsedTieredPlans,
                discounts:gotDiscount
		        };
		    }

		    var parsed = customParser(data);
		    return parsed;
        }

    });

    return priceListModel;

});
