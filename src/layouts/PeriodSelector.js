// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Fab from "$ecomponents/Fab/Group";
import React from "$react";
import DialogProvider from "$ecomponents/Form/FormData/DialogProvider";
import PropTypes from "prop-types";
import {defaultStr} from "$utils";
import DateLib from "$lib/date";
import notify from "$notify";
import {settings} from "$socket/utils";
import View from "$components/View";
import Label from "$components/Label";
import theme from "$theme";

export default function LoadCurvePeriodSelectorComponent({onRefresh,startDateValue,extendActions,endDateValue,meter,refreshActionProps,editActionProps,testID,startDate,endDate,onUpdatePeriod,...props}){
    const dialogRef = React.useRef(null);
    const startDateRef = React.useRef(startDate);
    const endDateRef = React.useRef(endDate);
    const prevStartDate = React.usePrevious(startDate);
    const prevEndDate = React.usePrevious(endDate);
    const forceRender = React.useForceRender();
    startDateValue = DateLib.isValid(startDateValue) ? startDateValue : null;
    endDateValue = DateLib.isValid(endDateValue) ? endDateValue : null;
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
    const isBAMode = settings.isBAMode(meter);
    meter = defaultObj(meter);
    const BAText = isBAMode?"non connecté [BA]":"connecté";
    return <>
        <Fab
            {...props}
            icon = "calendar"
            visible
            testID = {testID}
            actions ={[
                ...Object.toArray(extendActions),
                {
                    icon :  isBAMode ? "thermometer-off" : "thermometer",
                    text : "Mode {0}".sprintf(BAText),
                    title : 'Les requêtes s\'exécutent actuellement en mode {0}. Cliquez pour modifier le mode d\'exécution des requêtes'.sprintf(BAText),
                    onPress : ()=>{
                        settings.toggleBAMode(meter);
                        forceRender();
                        //return refresh();
                    },
                },
                {
                    error  : true,
                    ...refreshActionProps,
                    text : defaultStr(refreshActionProps.text,"Actualiser | {0}".sprintf(meter.name)),
                    icon : defaultStr(refreshActionProps.icon,"material-refresh"),
                    onPress : ()=>{
                        refresh();
                    },
                    title : periodeTitle,
                },
                {
                    
                    secondary : true,
                    ...editActionProps,
                    text : defaultStr(editActionProps.text,"Modifier période | {0}".sprintf(meter.name)),
                    icon : defaultStr(editActionProps.icon,"calendar"),
                    onPress : ()=>{
                        DialogProvider.open({
                            title :"Période d'exécution de la requête | {0}".sprintf(meter.name),
                            subtitle : false,
                            header : startDateValue && endDateValue && <View style={[theme.styles.pl1,theme.styles.pr1,theme.styles.mh1]}>
                                <Label>Résultats obtenues dans la période du {startDateValue.toFormat()} à {endDateValue.toFormat()}</Label>
                            </View> || null,
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
    editActionProps : PropTypes.object, //les props du bouton modifier,
    extendActions : PropTypes.oneOfType([
        PropTypes.objectOf(PropTypes.object),
        PropTypes.arrayOf(PropTypes.object)
    ]),//les actions supplémentaires
}