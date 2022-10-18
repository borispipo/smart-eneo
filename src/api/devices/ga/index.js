import { isNonNullString } from "$utils";
import {fetch} from "$api";

export const API_PATH = "/devices/ga";

/*** recupère la liste des GA distante */
export default function fetchGAList (options){
    return fetch(API_PATH,options);
}

export {fetchGAList};

const GA_DEVICES_API_PATH = "/devices/ga/";

/*** get list of devices of an given GA
 * @param {string} gaId, GA id
 * @param {object} options, fetch Options
 * @return {Promise}
 */
export function fetchMetersListFromGA (gaId, options){
    if(!isNonNullString(gaId)){
        return Promise.reject({msg:'Yous must specify GA ID',stauts:false});
    }
    const apiPath= GA_DEVICES_API_PATH+(gaId.trim().ltrim("/").rtrim("/"));
    return fetch(apiPath,options);
}   

/*** get list of devices of an given GA
 * @param {string} gaId, GA id
 * @param {number} meterIndex : l'index du meter dans la liste des ga
 * @param {object} options, fetch Options
 * @return {Promise}
 */
 export function fetchMeterFromGA (meterIndex,gaId, options){
    if(!isNonNullString(gaId)){
        return Promise.reject({msg:'Yous must specify GA ID',stauts:false});
    }
    const apiPath= GA_DEVICES_API_PATH+(gaId.trim().ltrim("/").rtrim("/"))+"/"+meterIndex;
    return fetch(apiPath,options);
} 

export const fetchMetersList = fetchMetersListFromGA;