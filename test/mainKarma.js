var tests = [];
for (var file in window.__karma__.files) {
    if (file.indexOf('/test') != -1) {
        console.log('the test file:' + file)
        tests.push(file);
    }
} 

requirejs.config({
  
    // Karma serves files     
    baseUrl: 'http://localhost:9876',
    
    paths: {
        'constants': '/app/src/scripts/services/constants'
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});