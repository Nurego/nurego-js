(function () {
  function htmlCb() {
    //Check if element exist
    if (Nurego.p.bills_element_id) {
        var element = document.getElementById(Nurego.p.bills_element_id);
        if (element) {
            element.appendChild(bills_container);
        }
        else {
            document.body.appendChild(bills_container);
            throw "Element '#" + Nurego.p.bills_element_id + "' not found.";
        }
    }
  }

  this.Nurego.renderCustomerBills = function(billsData, callback) {
    bills_container = document.createElement('div');

    $.get(NuregoUtils.getHtmlUrl("bills"), function(billsHTML) {
      try {
        var billsTable = $(billsHTML);
        
        var bills = billsData.bills.data;

        var tbody = billsTable.find("tbody.nr-bills");
        var bill_tr_tmpl = billsTable.find(".nr-bills tr.nr-bill-record");
        var bill_period_tmpl = bill_tr_tmpl.find("td.nr-bill-period");
        var bill_total_tmpl = bill_tr_tmpl.find("td.nr-bill-total");
        var bill_status_tmpl = bill_tr_tmpl.find("td.nr-bill-status");
        for (i = 0; i < bills.length; i++) {
          var tr_bill = bill_tr_tmpl.clone().html("");
          var td_bill_period = bill_period_tmpl.clone();
          var td_bill_total = bill_total_tmpl.clone();
          var td_bill_status = bill_status_tmpl.clone();
          td_bill_period.attr("data-id", bills[i].id);
          td_bill_period.find("span a").html(moment(bills[i].period_start_time).format("MM/DD/YYYY") + " - " + moment(bills[i].period_end_time).format("MM/DD/YYYY"));
          td_bill_period.find("span a").attr("href", Nurego.p.bill_url + bills[i].id);
          td_bill_period.show();
          tr_bill.append(td_bill_period);
          td_bill_total.html("$" + Number(bills[i].total_owed).toFixed(2));
          td_bill_total.show();
          tr_bill.append(td_bill_total);
          td_bill_status.html(bills[i].charge_state);
          td_bill_status.show();
          tr_bill.append(td_bill_status);

          tbody.append(tr_bill);
        }
        
        $(bills_container).prepend("<span class='header-2'>Bills List:</span><br/><br/>");
        $(bills_container).append("<div id='myBill' class='reveal-modal reveal-modal-bg' style='display: none' data-reveal><h2>Awesome. I have it.</h2><a class='close-reveal-modal'>&#215;</a></div>");
        bills_container.appendChild(billsTable[0]);
      } catch (e) {
          NuregoUtils.nr_error(e);
      }
      
      callback();
    });
  }


  this.Nurego.getBillsPath = function() {
    return Nurego.p.nurego_url + Nurego.p.my_bills_path;
  }
  

  this.Nurego.getBillsForRender = function() {
    //Fetch pricing data
    var scr = document.createElement('script');
    scr.type = 'text/javascript';
    scr.async = true;
    scr.src = Nurego.getBillsPath() //TODO document.location.protocol + '//..'
        + Nurego.p.api_key
        + '&organization=' + Nurego.p.org_guid
        + '&callback=nr_callback_my_bills';
    if (Nurego.p.date_from && Nurego.p.date_to){
      scr.src += '&date_range=' + Nurego.p.date_from + ',' + Nurego.p.date_to;
    }
    var nr = document.getElementsByTagName('script')[0];
    nr.parentNode.insertBefore(scr, nr);
  }


  nr_callback_my_bills = function (response) {
    Nurego.renderCustomerBills(response, htmlCb);
  }
  
  
})();
