/**** récupère l'id de la données de structure passée en paramètre */
export default (tableName)=>{
    if(!isNonNullString(tableName)){
        return null;
    }
    return tableName.toUpperCase().trim();
}