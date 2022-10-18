import * as LOGICAL_NAMES from "./logicalNames";

export * from "./logicalNames";

export default LOGICAL_NAMES;

export {default as LOGICAL_NAMES_VALUES_TYPES} from "./types";

export {default as LOGICAL_NAMES_VALUES_UNITS} from "./units";

/*** retourne le logical name passé en paramètre 
 * @param logicalName {string|object}, le nom du logicalName ou l'un des objets pris dans LOGICAL_NAMES
 * @param key {string},default 'code', la clé dont on veut récupérer la valeur dans la liste des logicalName
 * @reaturn {any}, la valeur trouvé dans l'objet LOGICIAL_NAME correspondant à l'une des logical name de LOGICAL_NAMES
*/
export const getLogicalName  = (logicalName,key)=>{
    if(isObj(logicalName) && isNonNullString(logicalName.name)){
        logicalName = logicalName.name;
    }
    logicalName = defaultStr(logicalName).toUpperCase().trim();
    if(!logicalName || !isObj(LOGICAL_NAMES[logicalName])) return undefined;
    const l = LOGICAL_NAMES[logicalName];
    return l[defaultStr(key,'code')] || undefined;
}

/*** idem à getLogicialName mais retourne les valeurs séparées par le champ séparateur
 * passé en paramètre
 * @param key {string}, la clé dont on veut récupérer dans la liste
 * @param logicalNames {object||array}, la liste des logicalName dont on veut avoir, par défaut tous les logicalNames
 * @param separator {string},le séparateur à utiliser pour séparer le valeurs retrouvées
 */
export const getLogicalNames = (key,logicalNames,separator)=>{
    logicalNames = typeof logicalNames =='object' && logicalNames ? logicalNames : LOGICAL_NAMES;
    let r = [];
    for(let i in logicalNames){
        const v = logicalNames[i];
        const tv = getLogicalName(v,key);
        if(tv !== undefined && tv !== null){
            r.push(tv.toString())
        }
    }
    return r.join(defaultStr(separator,','));
}

