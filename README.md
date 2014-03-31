###Step 1
First, include Nurego.js in the page. We recommend putting the script tag in the ```<head>``` tag.
```JavaScript
<script type="text/javascript" src="https://js.nurego.com/v1/"></script>
<script type="text/javascript">
Nurego.setApiKey('API_KEY');
</script>
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
    element_id: null,
    theme: 'nr-default',
    css_url: null,
    select_url: '/?plan_id=',
    select_callback: null,
    label_price: 'Monthly cost',
    label_select: 'Select',
    label_feature_on: '<span class="nr-check nr-yes"></span>',
    label_feature_off: '<span class="nr-check nr-no"></span>',
    label_before_price: '$',
    label_after_price: '',
    time_out: 5 * 1000, //Milliseconds,
    loading_class: 'nr-container nr-loading',
    error_class: 'nr-notify nr-red',
    warning_class: 'nr-notify nr-yellow',
    empty_class: 'nr-container nr-empty',
    price_class: 'nr-price',
    ...
}
```