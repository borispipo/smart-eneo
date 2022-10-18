import {fetchMetersList as fetchRemoteMeters } from "$api/devices";
import {isValidMeter} from "$database/data/devices";
import Preloader from "$preloader";
import { upsertMeter} from "$database/data/devices";
import notify from "$notify";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";


export function fetchMetersList(opts){
    opts = typeof opts =="object" && opts ? opts : {};
    const check = opts.check ? true : false;
    return new Promise((resolve,reject)=>{
        fetchRemoteMeters().then(({data})=>{
            let i = 0, count = data.length;
            const result = [];
            const next = ()=>{
                if(i > count){
                    resolve(result)
                    if(check){
                        const pl = (result.length>1 ? "s":"");
                        const msg = result.length.formatNumber()+" compteur"+pl+" enregistré"+pl;
                        Preloader.open(msg);
                        setTimeout(()=>{
                            notify.success(msg);
                            Preloader.close();
                        },1000);
                    }
                    return;
                }
                const meter = data[i];
                const index = i+1, percent = (index*100/count);
                i++;
                if(!isValidMeter(meter)){
                    return next();
                }
                if(check){
                    Preloader.open({
                        title : "Récupération des compteurs",
                        content : <View> 
                             <Label textBold>GA {index.formatNumber()}{"/"}{count.formatNumber()}, {percent+" "} réalisé(s)... </Label>
                        </View>,
                    });
                }
                upsertMeter(meter).then(()=>{
                    result.push(meter);
                    next();
                }).catch((e)=>{
                    console.log(e," on upserting local meta",meter);
                    notify.error(e);
                    next();
                });
            }
            next();
        }).catch((e)=>{
            notify.error(e);
            reject(e);
        });
    })
}

/*** permet de vérifier la persistance en bd des compteurs */
export const checkSavedMeters = ()=>{
    ///on cherche à trouver la liste des compteurs si elle n'esiste pas alors on la créée;
    Preloader.open("Vérification de la liste des compteurs enregistrés en local");
    return fetchMetersList({check:true}).then((l)=>{
        return l;
    }).finally((e)=>{
       setTimeout(()=>{
        Preloader.close();
       },1000)
    })
}