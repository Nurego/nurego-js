This JS library renders "canonical" pricing page based on the plans published through Nurego service

To use the library, two very simple steps needed

###Step 1
First, include Nurego.js in the page. We recommend putting the script tag in the ```<head>``` tag.
```JavaScript
<script type="text/javascript" src="http://js.nurego.com/v1/lib/js/nurego.js"></script>
```

###Step 2
After the first step, instantiate a Nurego object for each offering you wish to call, and set your api keys. Put this code in ```<body>``` tag. You can get api key from your account.
```JavaScript
<script type="text/javascript">
var my_offering = new Nurego('<API KEY>');
my_offering.get_offering(my_offering.callback, my_offering.nr_error);
</script>
```
Pricing plans will be rendered automatically on your page.

That's all!

###Advanced
Some advanced installation are shown here.
```JavaScript
<script type="text/javascript">
//Insert plans into specific block.
my_offering = new Nurego('<API KEY>');
my_offering.css_url = '/absolute/path/to/CSS';
my_offering.element_id = 'id_of_element_to_append_table';
my_offering.get_offering(my_offering.callback, my_offering.nr_error);
</script>
...
<div id="my_block">
    <!-- Pricing plans will be here. -->
</div>
```

###Default parameters
You can override parameters by using ```Nurego_object_instance.parameter= 'PARAMETER'```.
```JavaScript
{
    element_id: null, //Id of the DOM element. (string or null)
    theme: 'nr-default', //CSS class for pricing table. (string or null)
    css_url: 'http://js.nurego.com/v1/lib/css/themes.css', //Url to custom CSS file. (string or null)
    select_url: '/?plan_id=', //Url prefix for plan link. (string)
    select_callback: null, //Callback function after selecting plan. (function or null)
    label_price: 'Monthly cost', //Label in Price column. (string)
    label_select: 'Select', //Label on Select button. (string)
    label_feature_on: '<span class="nr-check nr-yes"></span>', //String for enabled option. (string)
    label_feature_off: '<span class="nr-check nr-no"></span>', //String for disabled option. (string)
    label_before_price: '$', //Prefix for price value. (string)
    label_after_price: '', //Suffix for price value. (string)
    time_out: 5 * 1000, //Timeout in milliseconds. (integer)
    loading_class: 'nr-container nr-loading',  //CSS class for loading block. (string)
    error_class: 'nr-notify nr-red', //CSS class for error block. (string)
    warning_class: 'nr-notify nr-yellow', //CSS class for waring block. (string)
    empty_class: 'nr-container nr-empty', //CSS class for empty block. (string)
    price_class: 'nr-price', //CSS class for price block. (string)
    ...
}
```

###Don't like our pricing page, feel free to create your own. 

This is the simple way to query published plans through the JSONP query

```HTML
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
</head>

<body>
<script type="text/javascript">

    $(document).ready(function () {
        var url = 'http://api.nurego.com/v1/offerings?api_key=<YOUR API KEY>';

        $.ajax({
            url:  url + '&callback=?',
            type: "GET",
            dataType: "jsonp",
            success: getOfferingsCallback
        });

    });

    function getOfferingsCallback(json) {
        if(json.plans.data == undefined){
            $( ".data" ).append( "Error:" + json.error + "<br>");
        }else{
            $( ".data" ).append( "<h2>OFFERINGS</h2><br>");
            $.each(json.plans.data, function( index, plan ) {
                $( ".data" ).append( "<h4>" + plan.name + "</h4>");
                $.each(planfeatures.data, function( index, feature ) {
                    $( ".data" ).append( feature.name + " : " + ((feature.max_unit > 0) ? feature.max_unit : "yes" ) + "<br>");
                });
            });
        }
    }

</script>
<div class="wrapper">
    Hello
</div>
<div class="data"></div>
</body>
</html>
```

