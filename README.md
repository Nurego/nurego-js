###Code v1 (short)

```JavaScript
<script type="text/javascript">var nr_params = {api_key: '<API_KEY>'};</script>
<script type="text/javascript" src="<URL_TO_PRICING_LIBRARY>">
```


###Code v2 (normal)

```JavaScript
<script type="text/javascript">
    var nr_params = {
        api_key: '<API_KEY>'
    };
    (function () {
        var scr = document.createElement('script');
        scr.type = 'text/javascript';
        scr.async = true;
        scr.src = document.location.protocol + '//<DOMAIN>/<PATH_TO_PRICING_LIBRARY>';
        var nr = document.getElementsByTagName('script')[0];
        nr.parentNode.insertBefore(scr, nr);
    })();
</script>
```

###Default params

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