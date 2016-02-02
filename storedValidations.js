/* Stored Validations
/ This is a sample file provided to give an example of how to store a validation script 
/ for multiple executions.  
*/

var storedValidations = {
	exampleValidation: function(dataObject){
		mC.clear();
		mC.sBO({name:"tw.local.request", value: dataObject});
		mC.aOV("address", ["address1", "city", "state", "zip"]);
		mC.sBO({name:"tw.local.request.customer", value: dataObject.customer});
		mC.aFV("email", [], "email");
		if(dataObject.customer.accountingEmail != ""){
			mC.aFV("accountingEmail", [], "email");
		}
		mC.val();
		/*
		/   In the above example we've:
		/	- Cleared previous stuff for saftey
		/	- Set the base object to the tw.local.request variable 
		/	- This script assums that dataObject = tw.local.request
		/	- Checks an address object for 4 required fields
		/	- Switches the base object down to the the child customer completx object
		/	- Validates the email with and email regex
		/	- Conditionaly validates the accountingEmail variable if it is provided
		/	- Then the validation executes
		*/
	},
	exampleValidation2: function(dataObject){
		mC.clear();
		mC.mC.sBO({name:"tw.local.request", value: dataObject});
		mC.aFV("email", [], "email");
		mC.val();
	}
};

/*  
/  In this example I wrote a validation for one coach but then wanted to use it again for another coach downstream.
/  Now instead of copying and pasting the code I can store it in this file and simply call:
/  mC.exec("exampleValidation", tw.local.request); 
/// OR
/  motoChecker.executeStoredValidation("exampleValidation", tw.local.request);
/  in my both coaches.  This helps ensure that your validation stays consistent.
/  
/ This storedValidations file should be uploaded as a server file just like motoChecker.js.
/ The variable "storedValidations" connot exist twice.  So to add additional stored validations to the object like an array.
*/