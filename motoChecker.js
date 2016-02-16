/* MotoChecker v3.0.0
* The special edition with more dewbacks so you know it's good.
* This validation library seeks to limit the amount of code required to perform validation in IBM BPM
* Please see http://www.joemotacek.com/motovalidation-2-0 for documentation
*/
var motoChecker = (function(){
    //Private Vars
    var baseObject = {};
    var validateFields = [];
    //REGEXs
    //Alpha with spaces and hyphens
    var alphaSpaceRegEx = /^[-\ a-zA-Z]+$/;
    //Email format
    var emailRegEx = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    //US Phone Number either (XXX) XXX-XXXX or XXX-XXX-XXXX
    var usPhoneRegEx = /^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/;
    //Loose phone validation validate for the following use cases
    /*
    / 1-234-567-8901
    / 1-234-567-8901 x1234
    / 1-234-567-8901 ext1234
    / 1 (234) 567-8901
    / 1.234.567.8901
    / 1/234/567/8901
    / 12345678901
    */
    var phoneRegEx = /^([\d\-\.\ \/\(\)(x|ext)]+)$/;
    //Bank Rounting Number validation 2015
    var bankRoutingRegEx = /^((0[0-9])|(1[0-2])|(2[1-9])|(3[0-2])|(6[1-9])|(7[0-2])|80)([0-9]{7})$/;


    //Private Mehtods
    var motoCheckerException = function(message) {
        this.message = message;
        this.name = "MotoChecker Exception";
    };

    var messageCheck = function(value, defaultMessage){
        if(value == ""){
            return defaultMessage;
        }else{
            return value
        }
    };

    var getNextObject = function(baseObject, valueName){
        if(baseObject.toString() != "[TWLocal]"){
            return baseObject.getPropertyValue(valueName);
        }else{
            throw new motoCheckerException("You can not get a variable from the Local Object, method does not exist.");
        }
    }

    var validateCase = function(value, location, validationType, message, customFunction){
        if(validationType == "required-string"){
            message = messageCheck(message, "Field is required");
            if(typeof value == "undefined" || !value){
                tw.system.addCoachValidationError(tw.system.coachValidation, location, message);
            }else{
                if(typeof value != "string"){
                    throw new motoCheckerException("Required only applies to strings.  Please check your variables & code.");
                }
                if(value.trim() == ""){
                    tw.system.addCoachValidationError(tw.system.coachValidation, location, message);
                }
            }
        }
        if(validationType == "email" && !emailRegEx.test(value)){
            message = messageCheck(message, "Please provide a valid email address");
            tw.system.addCoachValidationError(tw.system.coachValidation, location, message);
        }
        if(validationType == "phone" && !phoneRegEx.test(value)){
            message = messageCheck(message, "Please provide a valid phone number");
            tw.system.addCoachValidationError(tw.system.coachValidation, location, message);
        }
        if(validationType == "usPhone" && !usPhoneRegEx.test(value)){
            message = messageCheck(message, "Please provide a phone number in the format of (123) 456-7890 or 123-456-7890");
            tw.system.addCoachValidationError(tw.system.coachValidation, location, message);
        }
        if(validationType == "boolean-true" && !value){
            message = messageCheck(message, "Please complete");
            tw.system.addCoachValidationError(tw.system.coachValidation, location, message);
        }
        if(validationType == "bank-routing" && !bankRoutingRegEx.test(value)){
            message = messageCheck(message, "Please provide a valid routing number");                    
            tw.system.addCoachValidationError(tw.system.coachValidation, location, message);
        }
        if(validationType == ">0"){
            if(typeof value != "number"){
                throw new motoCheckerException("Greater than 0 only applies to Numbers.  Please check your variables & code.");
            }
            if(value <= 0){
                message = messageCheck(message, "Number must be greater than 0");                    
                tw.system.addCoachValidationError(tw.system.coachValidation, location, message);
            }
        }
        if(validationType == "custom"){
            if( typeof customFunction === "function"){
                if(!customFunction(value)){
                    message = messageCheck(message, "Custom validtion failed");
                    tw.system.addCoachValidationError(tw.system.coachValidation, location, message);
                }
            }else{
                throw new motoCheckerException("Custom parameter must be of type function.");
            }
        }
    }

    //Public Methods
    var validator = {
        clearValidateFields: function(){
            validateFields = [];
        },
        clear: function(){
            this.clearValidateFields();
        },
        setBaseObject: function(newBaseObject){
            //base object should be in a simple name value pair format
            //e.g. {name: "tw.local.myobject", value: tw.local.myobject}
            if(typeof newBaseObject != "undefined"){
                if(typeof newBaseObject.name == "string"  && typeof newBaseObject.value != "undefined"){
                    baseObject = newBaseObject;
                }else{
                    throw new motoCheckerException("Base Object does not meet {name: 'string', value: object} format.");
                }
            }
        },
        sBO: function(newBaseObject){
            this.setBaseObject(newBaseObject);
        },
        addFieldValidation: function(fieldName, subObject, validationType, message, custom){
            //subObject, message & validationType are optional parameters
            if(typeof message == "undefined"){message = "";}
            if(typeof validationType == "undefined"){validationType = "required-string";}
            if(typeof subObject == "undefined"){subObject = [];}
            
            if(typeof baseObject != "undefined"){
                var baseBO = baseObject.value;
                var basePath = baseObject.name+".";
            }else{
                throw new motoCheckerException("Base Object Undefined");
            }
            
            if( Object.prototype.toString.call(subObject) === '[object Array]'){
                for(var i = 0; i < subObject.length; i++){
                    baseBO = getNextObject(baseBO, subObject[i]);
                    basePath += subObject[i]+".";
                }
            }
            if(fieldName && fieldName != ""){
                var newValidation = {
                    message: message,
                    location: basePath + fieldName,
                    value: getNextObject(baseBO, fieldName),
                    type: "single",
                    validation: validationType,
                    custom: custom
                }
            }else{
                var newValidation = {
                    message: message,
                    location: basePath,
                    value: baseBO,
                    type: "single",
                    validation: validationType,
                    custom: custom
                }
            }
            validateFields.push(newValidation);
        },
        aFV: function(fieldName, subObject, validationType, message, custom){
            //function short name
            this.addFieldValidation(fieldName, subObject, validationType, message, custom);
        },
        addObjectValidation: function(objectName, values, type, validationType, message, custom){
            //type, message & validationType are optional parameters
            if(typeof message == "undefined"){message = "";}
            if(typeof validationType == "undefined"){validationType = "required-string";}
            if(typeof type == "undefined"){
                type = "object";
            }else if(type != "object"  && type != "list"){
                type = "object";
            }
            
            //Error checking
            if(typeof baseObject != "undefined"){
                var baseBO = baseObject.value;
                var basePath = baseObject.name+".";
            }else{
                throw new motoCheckerException("Base Object Undefined");
            }
            
            if( Object.prototype.toString.call(values) != '[object Array]'){
                throw new motoCheckerException("Value parameter must be of type array in addObjectValidation method");
            }
            if(objectName && objectName != ""){
                var newValidation = {
                    message: message,
                    location: basePath + objectName,
                    object: getNextObject(baseBO, objectName),
                    values: values,
                    type: type,
                    validation: validationType,
                    custom: custom
                }
            }else{
                var newValidation = {
                    message: message,
                    location: basePath,
                    object: baseBO,
                    values: values,
                    type: type,
                    validation: validationType,
                    custom: custom
                }
            }
            
            validateFields.push(newValidation);
        },
        aOV: function(objectName, values, type, validationType, message, custom){
            //function short name
            this.addObjectValidation(objectName, values, type, validationType, message, custom);
        },
        validate: function(){
            //Loop through and do checks
            var message = "";
            for(var i = 0; i < validateFields.length; i++){
                if(validateFields[i].type == "single"){
                    validateCase(validateFields[i].value, validateFields[i].location, validateFields[i].validation, validateFields[i].message, validateFields[i].custom);
                }
                if(validateFields[i].type == "object"){
                    for (var j = 0; j < validateFields[i].values.length; j++){
                        var valueName = validateFields[i].values[j];
                        validateCase(validateFields[i].object[valueName], validateFields[i].location + "." + valueName, validateFields[i].validation, validateFields[i].message, validateFields[i].custom);
                    }
                }
                if(validateFields[i].type == "list"){
                    for (var k = 0; k < validateFields[i].object.length; k++){
                        for (var l = 0; l < validateFields[i].values.length; l++){
                            var valueName = validateFields[i].values[l];
                            validateCase(validateFields[i].object[k][valueName], validateFields[i].location+"["+k+"]." + valueName, validateFields[i].validation, validateFields[i].message, validateFields[i].custom);
                        }
                    }
                }
            }
            //clear the validation so it's rebuilt next time...
            validateFields = [];
        },
        val: function(){
            this.validate();
        },
        executeStoredValidation: function(validationName, object){
            if(typeof storedValidations != "undefined"){
                if(typeof storedValidations[validationName] != 'function'){
                    throw new motoCheckerException("You must provide a valid stored validation name.");
                }else{
                    storedValidations[validationName](object);
                }
            }else{
                throw new motoCheckerException("There are no stored validations.");
            }
        },
        exec: function(validationName, object){
            this.executeStoredValidation(validationName, object)
        }
    };
    return validator;
})();
var mC = motoChecker;