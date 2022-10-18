import {isValidEmail} from "$utils";
export default function({formName,step,data,nextButtonRef,state}){
    const fields = {};
    if(step <=1){
        fields.email = 
        {
            text : 'Email',
            validType : 'email',
            autoFocus : true,
            affix : false,
            required : true,
            defaultValue : data.email,
            onValidatorValid : (args)=>{
                if(nextButtonRef.current && nextButtonRef.current.enable){
                    nextButtonRef.current.enable();
                }
            },
            onNoValidate : (a)=>{
                if(nextButtonRef.current && nextButtonRef.current.disable){
                    nextButtonRef.current.disable();
                }
            },
        };
    } else {
        fields.password = {
            type : 'password',
            autoFocus : true,
            defaultValue : data.password,
            readOnly : false,
            editable : true,
            required : true,
            visible : step >= 2,
            text : 'Mot de pass',
        }
    }
    return {
        canSubmit :({step,data})=> step>=2 && isValidEmail(data.email),
        fields,
    }
}