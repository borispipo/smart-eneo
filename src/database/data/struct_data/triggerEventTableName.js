export default (tableName)=>{
    return isNonNullString(tableName)? "STRUCT_DATA/"+tableName : undefined;
}