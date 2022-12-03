import * as LOGICAL_NAMES from "./logicalNames";
import {isNonNullString} from "$utils";

/**** le mappage entre les noms des logicals names et des code
 * les clés sont les codes et les valeurs sont les nom
 */
export const LOGICAL_NAMES_MAPPING ={};

for(let i in LOGICAL_NAMES){
    if(typeof LOGICAL_NAMES[i] =='object' && LOGICAL_NAMES[i] && LOGICAL_NAMES[i].code){
        LOGICAL_NAMES_MAPPING[LOGICAL_NAMES[i].code] = i;
    }
}

export * from "./logicalNames";

export default LOGICAL_NAMES;

export {default as LOGICAL_NAMES_VALUES_TYPES} from "./types";

export {default as LOGICAL_NAMES_VALUES_UNITS} from "./units";

export const getLogicalNameObject = (logicalName)=>{
    if(isObj(logicalName) && isNonNullString(logicalName.name)){
        logicalName = logicalName.name;
    }
    if(!isNonNullString(logicalName)) return null;
    logicalName = defaultStr(logicalName).toUpperCase().trim();
    if(LOGICAL_NAMES_MAPPING[logicalName]){
        logicalName = LOGICAL_NAMES_MAPPING[logicalName];
    }
    return LOGICAL_NAMES[logicalName] || null;
}

/*** retourne le logical name passé en paramètre 
 * @param logicalName {string|object}, le nom du logicalName ou l'un des objets pris dans LOGICAL_NAMES
 * @param key {string},default 'code', la clé dont on veut récupérer la valeur dans la liste des logicalName
 * @reaturn {any}, la valeur trouvé dans l'objet LOGICIAL_NAME correspondant à l'une des logical name de LOGICAL_NAMES
*/
export const getLogicalName  = (logicalName,key)=>{
    const l = getLogicalNameObject(logicalName);
    if(!l) return undefined;
    if(key===true) return l;
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

