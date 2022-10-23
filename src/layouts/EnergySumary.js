// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "$react";
import DateLib from "$date";
import { useSocket } from "$socket";
import { METER_TYPES } from "$database/data/devices";
import {isObj,defaultNumber,isNonNullString,defaultObj} from "$utils";
import Grid,{Cell} from "$ecomponents/Grid";
import View from "$ecomponents/View";
import theme from "$theme";
import Preloader from "$preloader";
import EnergySumaryItem from "./EnergySumaryItem";
import DateComponent from "$ecomponents/Date";
import Button from "$ecomponents/Button";
import notify from "$notify";
import { StyleSheet } from "react-native";
import DialogProvider from "$ecomponents/Form/FormData/DialogProvider";
import Icon from "$ecomponents/Icon";
import Label from "$ecomponents/Label";
import {isDesktopMedia} from "$dimensions";
import Time from "$ecomponents/Date/Time";

export default function EnergySumaryLayout({...props}){
    const defaultStartPariod = DateLib.getFirstDayOfMonth();
    const dialogRef = React.useRef(null);
    const startPeriodRef = React.useRef(defaultStartPariod);
    const endPeriodRef = React.useRef(new Date());
    const startPeriodTimerRef = React.useRef("00:00");
    const endPeriodTimeRef = React.useRef("00:00");
    const [state,setState] = React.useState({
        energies : [],
        isLoading : true,
    });
    const {sendBilanMessage} = useSocket();
    const values = {};
    const {energies} = state;
    energies.map((e)=>{
        if(!isObj(e) || !isNonNullString(e.device) || !isObj(e.payload) || !isObj(e.payload.value)) return;
        const type = e.device[0].toUpperCase();
        if(!METER_TYPES[type]){
            return;
        }
        values[type] = defaultObj(values[type]);
        Object.map(e.payload.value,(v,i)=>{
            if(typeof v !='number') return;
            values[type][i] = defaultNumber(values[type][i]);
            values[type][i]+= v;
        })
        
    });
    const refreshBilan = ()=>{
        Preloader.open("Récupération de la courbe des charges...");
        sendBilanMessage({
            dateStart : startPeriodRef.current,
            dateEnd : endPeriodRef.current,
        }).then(({payload:{value}})=>{
            if(Array.isArray(value)){
                setState({...state,energies:value,isLoading:false});
            }
        }).catch((e)=>{
            notify.error(e);
            setState({...state,isLoading:false})
        }).finally(()=>{
            Preloader.close();
        })
    }
    React.useEffect(()=>{
        refreshBilan();
    },[]);
    const setDates = ()=>{
        DialogProvider.open({
            title :"Période d'exécution de la requête",
            fields : {
                startPeriod : {
                    type : "date",
                    defaultValue : startPeriodRef.current,
                    label : 'Période de début',
                    /*right : (p)=><Time style={{width:60}} enableCopy={false} defaultValue={startPeriodTimerRef.current} onChange={(a)=>{
                        console.log(a," is changed heinn")
                    }}/>*/
                },
                endPeriod : {
                    type : "date",
                    defaultValue : endPeriodRef.current,
                    label : 'Période de fin'
                }
            },
            actions : [
                {
                    text : 'Actualiser',
                    icon : "refresh",
                }
            ],
            onSuccess : ({data})=>{
                if(data.startPeriod){
                    startPeriodRef.current = new Date(data.startPeriod);
                }
                if(data.endPeriod){
                    endPeriodRef.current = new Date(data.endPeriod);
                }
                DialogProvider.close(null,dialogRef);
                refreshBilan();
            }
        },dialogRef)
    }
    const periodeTitle = (startPeriodRef.current.toFormat()+" => "+endPeriodRef.current.toFormat());
    const testID = "RN_EnergySumarryScreen";
    return <View style={[theme.styles.w100,theme.styles.ph1]} testID={testID}>
        <View style={[theme.styles.w100,theme.styles.row,theme.styles.flexWrap,theme.styles.rowReverse]}>
            {false && isDesktopMedia() ? <Label textBold>Bilan énergetique sur la période : {periodeTitle}</Label>:null}
            <Button title={"Bilan énergetique sur la période : "+periodeTitle} onPress={refreshBilan} icon={"refresh"}
                right = {(p)=><Icon {...p} name="calendar"  onPress={setDates}/>}
            >
                Actualiser
            </Button>
        </View>
        <Grid testID={testID+"_Grid"}>
            {Object.mapToArray(METER_TYPES,(type,t)=>{
                return <Cell key={t} tabletSize={6} desktopSize={4} phoneSize={12} smallPhoneSize={12}>
                    <EnergySumaryItem
                        data = {values[t]}
                        meterType = {type}
                    />
                </Cell>
            })}
        </Grid>
        <DialogProvider ref={dialogRef}/>
    </View>;
}
const styles = StyleSheet.create({
    date : {
        width : 140,
    }
});
