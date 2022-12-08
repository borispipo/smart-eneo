// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Fab from "$elayouts/Fab";
import React from "$react";
import DialogProvider from "$ecomponents/Form/FormData/DialogProvider";
import PropTypes from "prop-types";
import {defaultStr} from "$utils";
import DateLib from "$lib/date";
import notify from "$notify";
import {settings} from "$socket/utils";

export default function LoadCurvePeriodSelectorComponent({onRefresh,refreshActionProps,editActionProps,testID,startDate,endDate,onUpdatePeriod,...props}){
    const dialogRef = React.useRef(null);
    const startDateRef = React.useRef(startDate);
    const endDateRef = React.useRef(endDate);
    const prevStartDate = React.usePrevious(startDate);
    const prevEndDate = React.usePrevious(endDate);
    refreshActionProps = defaultObj(refreshActionProps);
    editActionProps = defaultObj(editActionProps);
    let periodeTitle = "";
    if(DateLib.isValid(startDateRef.current) && DateLib.isValid(endDateRef.current)){
        periodeTitle = (startDateRef.current.toFormat()+" => "+endDateRef.current.toFormat());;
    } else if(isNonNullString(startDateRef.current) && isNonNullString(endDateRef.current)){
        periodeTitle = (startDateRef.current +" => "+endDateRef.current);;
    }
    testID = defaultStr(testID,"RN_LoadCurvePeriodSelectorComponent")
    const refresh = ()=>{
        if(typeof onRefresh =='function'){
            onRefresh({startDate:startDateRef.current,endDate : endDateRef.current})
        }
    }

    React.useEffect(()=>{
        if(prevStartDate == startDate && prevEndDate == endDate) return;
        startDateRef.current = startDate;;
        endDateRef.current = endDate;
    },[startDate,endDate])
    const isBAMode = settings.isBAMode;
    const BAText = isBAMode?"non connecté [BA]":"connecté";
    return <>
        <Fab
            {...props}
            icon = "calendar"
            visible
            testID = {testID}
            actions ={[
                {
                    icon :  isBAMode ? "thermometer-off" : "thermometer",
                    text : "Mode {0}".sprintf(BAText),
                    title : 'Les requêtes s\'exécutent actuellement en mode {0}. Cliquez pour modifier le mode d\'exécution des requêtes'.sprintf(BAText),
                    onPress : ()=>{
                        settings.toggleBAMode();
                        return refresh();
                    },
                },
                {
                    error  : true,
                    ...refreshActionProps,
                    text : defaultStr(refreshActionProps.text,"Actualiser"),
                    icon : defaultStr(refreshActionProps.icon,"material-refresh"),
                    onPress : ()=>{
                        settings.toggleBAMode();
                    },
                    title : periodeTitle,
                },
                {
                    
                    secondary : true,
                    ...editActionProps,
                    text : defaultStr(editActionProps.text,"Modifier période"),
                    icon : defaultStr(editActionProps.icon,"calendar"),
                    onPress : ()=>{
                        DialogProvider.open({
                            title :"Période d'exécution de la requête",
                            subtitle : false,
                            fields : {
                                startPeriod : {
                                    type : "datetime",
                                    defaultValue : startDateRef.current,
                                    label : 'Période de début',
                                },
                                endPeriod : {
                                    type : "datetime",
                                    defaultValue : endDateRef.current,
                                    label : 'Période de fin'
                                }
                            },
                            actions : [
                                {
                                    text : 'Actualiser',
                                    icon : "material-refresh",
                                    ///onPress : refresh
                                }
                            ],
                            onSuccess : ({data})=>{
                                const startPeriod = data.startPeriod ? new Date(data.startPeriod) : null;
                                const endPeriod = data.endPeriod ? new Date(data.endPeriod) : null;
                                if(startPeriod && endPeriod && startPeriod > endPeriod){
                                    notify.error("la période de début [{0}] doit être inférieure à la période de fin [{1}]".sprintf(startPeriod.toFormat(),endPeriod.toFormat()))
                                    return false;
                                }
                                if(startPeriod){
                                    startDateRef.current = startPeriod;
                                }
                                if(endPeriod){
                                    endDateRef.current = endPeriod;
                                }
                                refresh();
                                DialogProvider.close(null,dialogRef);
                            }
                        },dialogRef)
                    },
                }
            ]}
        />
        <DialogProvider ref={dialogRef}/>
    </> 
}

LoadCurvePeriodSelectorComponent.propTypes = {
    onRefresh : PropTypes.func,///la fonction permettant de rafraichir la courbe
    startDate : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
    ]),
    endPeriod : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
    ]),
    refreshActionProps : PropTypes.object,//les props du bouton action rafraichier
    editActionProps : PropTypes.object, //les props du bouton modifier
}