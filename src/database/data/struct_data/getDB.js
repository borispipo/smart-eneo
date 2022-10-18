import dbName from "./dbName";
import getDB from "$database/getDB";
export default (success,error)=>{
    let options = {};
    if(isFunction(success)){
        options = success;
    }
    success = isFunction(success)? success : options.success;
    error = isFunction(error)? error : options.error;
    options.dbName = dbName;
    return getDB(options);
}