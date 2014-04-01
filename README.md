###Step 1
First, include Nurego.js in the page. We recommend putting the script tag in the ```<head>``` tag.
```JavaScript
<script type="text/javascript" src="http://js.nurego.com/v1/lib/js/nurego.js"></script>
```

###Step 2
After the first step, set your api key. Put this code in ```<body>``` tag. You can get api key form your account.
```JavaScript
<script type="text/javascript">
Nurego.setApiKey('API_KEY');
</script>
```
Pricing plans will be printing automatically on your page.
That's all!

###Advanced
Some advanced installation are shown here.
```JavaScript
<script type="text/javascript">
//Insert plans into specific block.
Nurego.setParam('element_id', 'my_block');
Nurego.setApiKey('API_KEY');
</script>
...
<div id="my_block">
    <!-- Pricing plans will be here. -->
</div>
```

###Default parameters
You can override parameters by using ```Nurego.SetParam(<key>, <value>)``` function.
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