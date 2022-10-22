import {getDB,getData} from "$database";
import gaDBName from "./gaDBName";
import gaTable from "./gaTable";
import {isObj,isNonNullString,uniqid} from "$utils";
import meterTable from "./meterTable";
import theme from "$theme";

export {gaTable,gaTable as gaTableName};
export {meterTable, meterTable as meterTableName};
export {gaDBName as dbName};

export const METER_DB_NAME_PREFIX = "meter-db-";

export const getMeterDBNameFromType = (str)=>{
    if(!isNonNullString(str)) return undefined;
    str = str.trim();
    if(METER_TYPES[str.toUpperCase()]){
        str = METER_TYPES[str.toUpperCase()].code;
    }
    return METER_DB_NAME_PREFIX+(str.toLowerCase().ltrim(METER_DB_NAME_PREFIX));
}
const isM = (meter,type)=>{
    meter = isObj(meter)? meter.name : meter;
    return meter && typeof meter =='string' && meter.toLowerCase() == type.toLowerCase()? true : false;
}
export const METER_TYPES = {
    A : {
        key : "A",
        code : "incoming",
        label : "Entrant",
        icon : "arrow-down",
        get color (){
            return theme.colors.success;
        },
        /*** si le compteur passé en paramètre est de type entrant */
        is : meter => isM(meter,"A")
    },
    D : {
        key : "D",
        code : "outgoing",
        label : "Sortant",
        icon : "arrow-up",
        get color() {
            return theme.colors.error;
        },
        /*** si le compteur passé en paramètre est de type sortant */
        is : meter => isM(meter,"D")
    },
    T : {
        key : "T",
        code : "auxiliary",
        label : "Auxiliaires",
        icon : "format-align-middle",
        get color(){
            return theme.colors.warning;
        },
        /*** si le compteur passé en paramètre est de type auxiliaire */
        is : meter => isM(meter,"T")
    }
}
const _isMType = (type,mType)=>{
    if(isObj(type)){
        type = defaultStr(type.key,type.code);
    }
    if(isNonNullString(type)){
        type = type.trim();
        if(type.length !==1)
        type = type.toLowerCase().trim();
    }
    if(isNonNullString(type) && isObj(METER_TYPES[type]) && METER_TYPES[type].key == type){
        return true;
    }
    return type == mType? true : false;
}
/*** si c'est un compteur auxilière */
export const isMeterTypeAuxiliary = (type)=>{
    return _isMType(type,METER_TYPES.T.code)
}
/*** si c'est un compteur Incomming */
export const isMeterTypeIcomming = (type)=>{
    return _isMType(type,METER_TYPES.A.code)
}
/**** si c'est un compteur sortant */
export const isMeterTypeOutgoing = (type)=>{
    return _isMType(type,METER_TYPES.D.code)
}
export const ALL_METER_DATABASES = [];

Object.map(METER_TYPES,(m,c)=>{
    ALL_METER_DATABASES.push(getMeterDBNameFromType(m.code));
});

/**** recupère le type de meter à partir du nom de sa bd
 * @param {string} le nom de la bd de la meter dont on veut récupérer le type
 * @return {object|null}
 */
export const getMeterTypeFromDBName = (dbName)=>{
    if(!isNonNullString(dbName)) return null;
    dbName = dbName.toLowerCase().trim();
    dbName = dbName.ltrim(METER_DB_NAME_PREFIX).trim();
    for(let i in METER_TYPES){
        const t = METER_TYPES[i];
        if(t.code === dbName) return t;
    }
    return null;
}

export const METER_NAME_SEPARATOR = "_";

/*** retourne une information particulière issue du nom du meter
 *   *******les noms des meters sont codifiés de la forme : 
 *  TYPE_VoltageLevel_MeterName, séparés par un undescorre où : 
 *      --- meterType {string} représente le type de meter : A (entrant), D (sortant), T (transformateur source auxillaire)
 *      --- VoltageLevel {number}: le niveau de meterVoltage : 
 *      --- MeterName {string} : le nom du meter proprement dit
 *  @param {string|object} le meter en question
 *  @param {string}, la clé pour laquelle on souhaite recupérer l'information
 *  @return {number|string|object|undefined} si la clé n'est pas renseignée alors le résultat attendu sera un objet portant les différentes valeurs;

    Les champs qui sont enregistrés en dans la base locale sont : 
    {
        _id : l'id du meta, calculé à partir de son nom
        table : le nom de la table de données à utiliser pour faire la recherche
        meterType : {char}, le type de meta : A pour entrant, D pour sortant et T pour auxilière
        meterDBName {string}, le nom de la bd locale dans laquelle la meta est enreigstrée
        meterVoltage {number}, le niveau de tension
        meterName {string}, le nom de la meta qui est calculé, extrait du nom local
    }

*/
export function getValueFromMeterName(meter,key){
    let calculatedName = isValidMeter(meter) ? meter.name : isNonNullString(meter)? meter : undefined;
    if(!calculatedName){
        return undefined;
    }
    
    const meterName = calculatedName = calculatedName.toUpperCase().trim();
    const split = calculatedName.split(METER_NAME_SEPARATOR);
    ///le nom du meter doit avoir 3 informations
    if(split.length !== 3) return undefined;
    let meterType = undefined, meterVoltage = undefined,table=undefined, meterDBName=undefined, name = undefined;
    if(split[0]){
        meterType = split[0].toUpperCase().trim();
        if(METER_TYPES[meterType]){
            table = METER_TYPES[meterType].code;
            meterDBName = getMeterDBNameFromType(table);
        } else {
            return undefined;
        }
    } else return undefined;
    if(split[1]){
        meterVoltage = parseFloat(split[1].trim());
    }
    if(split[2]){
        name = split[2].trim();
    }
    if(isNonNullString(key)){
        key = key.trim();
        if(key === "dbName" || key =='table') return meterDBName;
        if(key.toLowerCase() =="_id" || key.toLowerCase() =="id") return name;
    }
    const ret = {meterType,name:meterName, meterName:name,meterVoltage,_id : meterName,meterDBName,table};
    if(isNonNullString(key)){
        return (ret[key] || undefined);
    }
    return ret;    
}   

export const isValidGA = (ga)=>{
    return isObj(ga) && isNonNullString(ga._id) && isNonNullString(ga.name) && typeof ga.devicesLength =='number' ? true : false;
}

export const getFieldsFromMeterName = getValueFromMeterName;


export const splitMeterName = getValueFromMeterName;


/*** vérifie si le meter passé en paramètre est valide */
export const isValidMeter = (meter)=>{
    return isObj(meter) && isNonNullString(meter.name) && isNonNullString(meter.gaId)? true : false;
}
export const isValidMeterToUpsert = (meter)=>{
    const fields = getValueFromMeterName(meter);
    return isObj(meter) && fields._id && fields.table && fields.meterDBName && fields.name ? fields : false;
}

export function getMeterDBFields(meter){
    const fields = getValueFromMeterName(meter);
    return isObj(fields)? fields : {};
}

export function getGAList (findOptions){
    return getData(gaDBName+"["+gaTable+"]",findOptions);
}


/*** cette fonction permet de mettre  à jour une GA ou une liste des GA passée en paramètre
 * @param {array|object}, si array alors il s'agit d'une liste des différents GA en insérer
 *  si object, alors il s'agit d'une ga unique à insérer
 */
export const upsertGA = (doc)=>{
    return new Promise((resolve,reject)=>{
        getDB(gaDBName).then(({db})=>{
            if(Array.isArray(doc)){
                ///on cache les ga trouvées dans la base locale à travers un buldoc
                const docsToUpsert = [];
                doc.map((doc)=>{
                    if(isObj(doc) && isNonNullString(doc._id)){
                        doc.table = gaTable;
                        docsToUpsert.push(doc);
                    }
                });
                if(docsToUpsert.length){
                    return db.bulkDocs(docsToUpsert).then((d)=>{
                        resolve(d);
                    }).catch((e)=>{
                        console.log(e," upserting bulk doc ga");
                        reject(e);
                    })
                }
                reject({status:false,msg:'Aucune Ga valide à insérer en base de données'});
            } else if(isObj(doc) && isNonNullString(doc.name)) {
                return db.upsert(doc._id,(nDoc)=>{
                    return {...nDoc,...doc};
                }).then((d)=>{
                    resolve(d);
                }).catch((e)=>{
                    console.log(e," upserting local ga doc");
                    reject(e);
                })
            }
            reject({status:false,msg:'Le type de données à inserer est invalide pour la GA'});
        }).catch(e=>{
            console.log(e," getting ga dbname");
            resject(e);
        })
    })
}

const _getDB = function(){
    return getDB(gaDBName);
}

export {_getDB as getDB};

export const upsertSingleMeter = (meter,gaId)=>{
    const fields = isValidMeterToUpsert(meter,gaId);
    if(!fields){
        return Promise.reject(({
            status : false, msg : "Merci de renseigner un compteur dont les informations sons valide"
        }))
    }
    return getDB(fields.meterDBName).then(({db})=>{
        return db.upsert(fields._id,(newDoc)=>{
            return {...newDoc,...meter,...fields}
        })
    });
}

/*** cette fonction permet de mettre  à jour une GA ou une liste des GA passée en paramètre
 * @param {array|object}, si array alors il s'agit d'une liste des compteurs à enregistrer simultanément
 *  un compteur est valide lorsqu'il continent : l'id de sa ga, champ gaId, son nom, champ name
 *  si object, alors il s'agit d'une ga unique à insérer
 */
 export const upsertMeter = (doc,gaId)=>{
    if(isValidMeter(doc)) return upsertSingleMeter(doc,gaId);
    if(Array.isArray(doc)){
        const docsToUpsert = {};
        let hasF = false;
        doc.map((m,i)=>{
            if(!isObj(m)) return;
            m.gaId = typeof m.gaId =='string' && m.gaId ? m.gaId : gaId;
            const fields = isValidMeterToUpsert(m);
            if(fields){
                docsToUpsert[fields.meterDBName] = Array.isArray(docsToUpsert[fields.meterDBName])? docsToUpsert[fields.meterDBName] : [];
                docsToUpsert[fields.meterDBName].push({...m,...fields});
                hasF = true;
            }
        })
        if(!hasF){
            return Promise.reject({status:false,msg:'Aucune données valide de compteur à insérer dans la liste des compteurs envoyée'});
        }
        const promises = [];
        Object.map(docsToUpsert,(docs,meterDBName)=>{
            promises.push(getDB(meterDBName).then(({db})=>{
                return db.bulkDocs(docs);
            }));
        });
        return Promise.all(promises);
    }
    return Promise.reject({status:false,msg:'Aucune de données de compteur valide à enresitrer'});
}

/*** retourne la liste des compteurs dont la ga est passée en paramère */
export function getMeterList (gaId,findOptions){
    if(!isNonNullString(gaId)){
        return Promise.reject({status:false,msg:'Vous devez spécifier la ga pour laquelle pour souhaitez obtenir la liste des compteurs'});
    }
    return getData(gaId+"["+meterTable+"]",findOptions);
}


export const getMetersCountFromType = (type)=>{
    const dbName = getMeterDBNameFromType(type);
    if(!dbName) return Promise.resolve(0);
    return getDB(dbName).then(({db})=>{
        return db.allDocs({include_docs:false}).then(({rows })=>{
            let c = 0;
            rows.map((r,i)=>{
                if(r.id &&  !r.id.contains('_design/')){
                    c++;
                } 
            })
            return c;
        });
        return db.info().then(info => info.doc_count)
    })
}

/***retourne le nombre total de compteurs dans les différentes base de données locales */
export const getMetersCount  = (opts)=>{
    const promises = [];
    ALL_METER_DATABASES.map((d)=>{
        promises.push(getMetersCountFromType(d,opts))
    })
    return Promise.all(promises).then((r)=>{
        let count = 0;
        for(let i in r){
            count += r[i];
        }
        return count;
    })
}

/**** retourne la liste des compteurs enregistrés en base de données pour le type passé en paramètre */
export function getMetersListFromType (type,pouchdbOptions){
    const dbName = getMeterDBNameFromType(type);
    if(!dbName){
        console.log(dbName," is not valid for type of meter ",type);
        return Promise.reject({status:false,msg:'Merci de préciser un type de compteur valide pour la liste à récupérer'});
    }
    pouchdbOptions = defaultObj(pouchdbOptions);
    pouchdbOptions.include_docs = pouchdbOptions.include_docs !== undefined ? pouchdbOptions.include_docs : true;
    return getDB(dbName).then(({db})=>{
        return db.allDocs({...pouchdbOptions,include_docs:true,'endkey': '_design', 'options.inclusive_end': false}).then(({total_rows,rows })=>{
            const r = [];
            Object.map(rows,(row,i)=>{
                if(isObj(row.doc) && row.doc._id && isValidMeter(row.doc)){
                    r.push(row.doc);
                }
            });
            return r;
        });
    })
}