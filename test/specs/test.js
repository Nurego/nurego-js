console.log('this is the test file')
console.log()
define(['constants'],function(constants){ 
	'use strict';
	describe("Elvenware Simple Plain Suite", function(){

	        it("expects true to be true", function() {
	            expect(1).toBe(2);
	        });

	        it("expects seven to be seven", function() {
	            expect(1).toBe(2);
	        });
	});
})