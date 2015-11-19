// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
require.config({
    paths: {
        json2: '../../bower_components/json2/json2',
        json3: '../../../bower_components/json3/lib/json3',
        requirejs: '../../bower_components/requirejs/require',
        text: '../../bower_components/requirejs-text/text',
        backbone: '../../bower_components/backbone/backbone',
        jquery: '../../bower_components/jquery/dist/jquery',
        'requirejs-text': '../../bower_components/requirejs-text/text',
        underscore: '../../bower_components/underscore/underscore',
        constants: '../services/constants',
        utils: '../services/utils',
        widgetFactory: '../services/widget_factory',
        loginModel: '../models/login',
        registrationModel: '../models/registration',
        priceListModel: '../models/price_list',
        tosModel: '../models/terms_of_service',
        tosStatusModel: '../models/terms_of_service_status',
        loginViewCtrl: '../components/login/login.ctrl',
        priceListViewCtrl: '../components/price_list/price_list.ctrl',
        registrationViewCtrl: '../components/registration/registration.ctrl',
        loginHTML: '../components/login/login.html',
        priceListHTML: '../components/price_list/price_list.html',
        priceListCSS: '../components/price_list/price_list.css',
        priceListSingleTierHTML: '../components/price_list/price_list_single_tier.html',
        registrationHTML: '../components/registration/registration.html',
        registrationCSS: '../components/registration/registration.css',
        tosHTML: '../components/terms_of_service/terms_of_service.html',
        termsOfServiceCSS: '../components/terms_of_service/terms_of_service.css',
        tosViewCtrl: '../components/terms_of_service/terms_of_service.ctrl',
        categoryViewCtrl: '../components/catalog/category/category.ctrl',
        categoryHTML: '../components/catalog/category/category.html',
        categoryModel: '../models/category',
        singleItemCtrl: '../components/catalog/single_item/single_item.ctrl',
        singleItemHTML: '../components/catalog/single_item/single_item.html',
        singleItemModel: '../models/service_single_item',
        categoryCSS: '../components/catalog/category/category.css',
        absHTML: '../components/abstract/abstract.html',
        absNuregoView: '../components/abstract/abstract.view',
        absNuregoCss: '../components/abstract/main.css',
        NuregoWidgets: '../app',
        almond: '../../bower_components/almond/almond',
        prism: '../../bower_components/prism/prism',
        'jquery-icheck': '../../bower_components/jquery-icheck/icheck.min',
        iCheck: '../../bower_components/iCheck/icheck.min',
        'font-awesome': '../../bower_components/font-awesome/fonts/*',
        unslider: '../../bower_components/unslider/src/unslider'
    },
    shim: {
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        unslider: {
            exports: 'unslider',
            deps: [
                'jquery'
            ]
        },
        jquery: {
            exports: '$Nurego'
        },
        iCheck: {
            deps: [
                'jquery'
            ],
            exports: 'iCheck'
        }
    },
    packages: [

    ]
});
