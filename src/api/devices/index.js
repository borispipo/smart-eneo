import {fetch} from "$api";

export * from "./ga";

/*** get list of meters */
export const API_PATH = "/meters";

export default function fetchDevicesList (options){
    return fetch(API_PATH,options);
}

export const fetchMetersList = fetchDevicesList;