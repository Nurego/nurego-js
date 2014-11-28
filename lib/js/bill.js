(function () {
  function htmlCb() {
  
    //Check if element exist
    if (Nurego.p.bill_element_id) {
        var element = document.getElementById(Nurego.p.bill_element_id);
        if (element) {
            element.appendChild(bill_container);
        }
        else {
            document.body.appendChild(bill_container);
            throw "Element '#" + Nurego.p.bill_element_id + "' not found.";
        }
    }
  }

  this.Nurego.renderCustomerBill = function(billData, callback) {
    bill_container = document.createElement('div');

    $.get(NuregoUtils.getHtmlUrl("bill"), function(billHTML) {
      try {
        var billTable = $(billHTML);
        var bill = billData.bill;
        var previous_bill = bill.previous_bill;

        // Billing Summary section
        var bill_summary_section = billTable.find("div#bill-summary");
        var statement_date = bill_summary_section.find("#nr-statement-date");
        var billing_period = bill_summary_section.find("#nr-billing-period");
        var statement_amount = bill_summary_section.find("#nr-statement-amount");
        var amount_before_proration = bill_summary_section.find("#nr-amount-before-proration");
        var last_payment = bill_summary_section.find("#nr-last-payment");
        var processing_date = bill_summary_section.find("#nr-processing-date");

        statement_date.find("#value").html(moment(bill.statement_date).format("MM/DD/YYYY"));
        statement_date.css('display', 'inline-block');
        billing_period.find("#value").html(moment(bill.period_start_time).format("MM/DD/YYYY") + " - " + moment(bill.period_end_time).format("MM/DD/YYYY"));
        billing_period.css('display', 'inline-block');
        statement_amount.find("#value").html("$" + bill.total_owed);
        statement_amount.css('display', 'inline-block').css('font-weight', 'bold');
        // If there was a previous bill, show price, date and link to bill
        if (previous_bill){
          last_payment.find("#date").html(moment(previous_bill.charge_date).format("MM/DD/YYYY"));
          last_payment.find("#amount").html("$" + previous_bill.total_owed);
          previous_bill_link = last_payment.find("#link a");
          previous_bill_link.attr("href", previous_bill_link.attr("href") + previous_bill.id);
          last_payment.css('display', 'inline-block');
        }
        processing_date.find("#value").html(moment(bill.charge_date).format("MM/DD/YYYY"));
        processing_date.css('display', 'inline-block');

        // Bill Details
        var steps = bill.steps;
        var tiered_items = [];
        var discount_items = [];
        var base_price = [];

        // Store step item in relevant array
        for (i = 0; i < steps.length; i++) {  
          if (steps[i].change == 0) continue; // Ignore row if change is null

          if (steps[i].step_type === "tiered"){
            tiered_items.push(steps[i]);
          }
          else if (steps[i].step_type.indexOf("trial") >= 0 || steps[i].step_type.indexOf("coupon") >= 0){
            discount_items.push(steps[i]);
          }
          else if (steps[i].step_type === "recurring"){
            base_price.push(steps[i]);
          }
          else if (steps[i].step_type === "prorate"){
            // Display prorate price only if change value is not 0
            if (steps[i].price_before){
              amount_before_proration.find("#value").html("$" + steps[i].price_before);
              amount_before_proration.css('display', 'inline-block');
            }
          }
          else {
            console.log("Step with type: " + steps[i].step_type)
          }
        }


        // Base Pricesection
        if (base_price.length > 0){
          var recurring_table = billTable.find("#bill-recurring");
          recurring_table.show();
          var tbody = billTable.find("tbody.nr-recurring");
          var recurring_tr_tmpl = tbody.find("tr.nr-recurring-record");
          var price_tmpl = recurring_tr_tmpl.find("td.nr-price");

          for (i = 0; i < base_price.length; i++) {
            var tr_recurring = recurring_tr_tmpl.clone().html("");
            var td_price = price_tmpl.clone();

            td_price.html("$" + base_price[i].change);
            td_price.show();
            tr_recurring.append(td_price);

            tbody.append(tr_recurring);
          }
        }


        // Discounts section
        if (discount_items.length > 0){
          var discounts_table = billTable.find("#bill-discounts");
          discounts_table.show();
          var tbody = billTable.find("tbody.nr-discounts");
          var discount_tr_tmpl = tbody.find("tr.nr-discount-record");
          var name_tmpl = discount_tr_tmpl.find("td.nr-discount");
          var unit_tmpl = discount_tr_tmpl.find("td.nr-unit");
          var price_percentage_tmpl = discount_tr_tmpl.find("td.nr-price-percentage");
          var amount_tmpl = discount_tr_tmpl.find("td.nr-amount");

          for (i = 0; i < discount_items.length; i++) {
            var tr_discount = discount_tr_tmpl.clone().html("");
            var td_name = name_tmpl.clone();
            var td_unit = unit_tmpl.clone();
            var td_price_percentage = price_percentage_tmpl.clone();
            var td_amount = amount_tmpl.clone();

            td_name.html(discount_items[i].discount.discount_name);
            td_name.show();
            tr_discount.append(td_name);
            td_unit.html(discount_items[i].discount.units_applied + " days");
            td_unit.show();
            tr_discount.append(td_unit);

            // Decide whether to display price or percentage for discount/trial
            if (discount_items[i].discount.price && discount_items[i].discount.price !== 0){
              tbody.find("th:nth-child(3)").html("Price"); // Replace % with price title
              td_price_percentage.html("$" + discount_items[i].discount.price);
            } 
            else {
              td_price_percentage.html(discount_items[i].discount.percent);
            }
            td_price_percentage.show();
            tr_discount.append(td_price_percentage);


            td_amount.html("$" + discount_items[i].change);
            td_amount.show();
            tr_discount.append(td_amount);

            tbody.append(tr_discount);
          }
        }


        // Feature/Tiered section
        if (tiered_items.length > 0){
          var features_table = billTable.find("#bill-features");
          features_table.show();
          var tbody = billTable.find("tbody.nr-features");
          var feature_tr_tmpl = tbody.find("tr.nr-feature-record");
          var name_tmpl = feature_tr_tmpl.find("td.nr-name");
          var unit_tmpl = feature_tr_tmpl.find("td.nr-unit");
          var unit_price_tmpl = feature_tr_tmpl.find("td.nr-unit-price");
          var price_tmpl = feature_tr_tmpl.find("td.nr-price");

          for (i = 0; i < tiered_items.length; i++) {
            var tr_feature = feature_tr_tmpl.clone().html("");
            var td_name = name_tmpl.clone();
            var td_unit = unit_tmpl.clone();
            var td_unit_price = unit_price_tmpl.clone();
            var td_price = price_tmpl.clone();

            td_name.html(tiered_items[i].feature.feature_name);
            td_name.show();
            tr_feature.append(td_name);
            td_unit.html(tiered_items[i].feature.units_applied);
            td_unit.show();
            tr_feature.append(td_unit);
            unit_price = tiered_items[i].feature.price_per_unit === null ? 0 : tiered_items[i].feature.price_per_unit;
            td_unit_price.html("$" + unit_price);
            td_unit_price.show();
            tr_feature.append(td_unit_price);
            td_price.html("$" + tiered_items[i].change);
            td_price.show();
            tr_feature.append(td_price);

            tbody.append(tr_feature);
          }
        }

        $(bill_container).prepend("<span class='header-2'>Your Bill</span><br/><br/>");
        bill_container.appendChild(billTable[0]);


      } catch (e) {
          NuregoUtils.nr_error(e);
      }
      
      callback();
    });
  }


  this.Nurego.getBillPath = function() {
    return Nurego.p.nurego_url + Nurego.p.my_bill_path;
  }
  

  this.Nurego.getBillForRender = function() {
    //Fetch pricing data
    var scr = document.createElement('script');
    scr.type = 'text/javascript';
    scr.async = true;
    scr.src = Nurego.getBillPath() //TODO document.location.protocol + '//..'
        + Nurego.p.bill_guid
        + '?api_key=' + Nurego.p.api_key
        + '&callback=nr_callback_my_bill'

    var nr = document.getElementsByTagName('script')[0];
    nr.parentNode.insertBefore(scr, nr);
  }


  nr_callback_my_bill = function (response) {
    Nurego.renderCustomerBill(response, htmlCb);
  }
  
  
})();
