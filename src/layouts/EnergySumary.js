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
import Surface from "$components/Surface";
import Divider from "$components/Divider";
import { iconSize,meterIcon } from "$screens/Devices/TreeView/utils";
import { ScrollView } from "react-native";
import LoadCurveScreen from "$screens/Devices/LoadCurve";
import { getMetersListFromType } from "$database/data/devices";
import Fab from "$elayouts/Fab";

export default function EnergySumaryLayout({...props}){
    const defaultStartPariod = DateLib.getFirstDayOfMonth();
    const dialogRef = React.useRef(null);
    const startPeriodRef = React.useRef(defaultStartPariod);
    const endPeriodRef = React.useRef(new Date());
    const meterRef = React.useRef(null);
    const forceRender = React.useForceRender();
    const [state,setState] = React.useState({
        energies : [],
        isLoading : true,
    });
    const {sendBilanMessage} = useSocket();
    const values = {};
    const {energies} = state;
    const metersByTypes = {};
    energies.map((e)=>{
        if(!isObj(e) || !isNonNullString(e.device) || !isObj(e.payload) || !isObj(e.payload.value)) return;
        const type = e.device[0].toUpperCase();
        if(!METER_TYPES[type]){
            return;
        }
        metersByTypes[type] = defaultObj(metersByTypes[type]);
        metersByTypes[type][e.device] = e.payload.value;
        values[type] = defaultObj(values[type]);
        Object.map(e.payload.value,(v,i)=>{
            if(typeof v !='number') return;
            values[type][i] = defaultNumber(values[type][i]);
            values[type][i]+= v;
        })
        
    });
    const refreshBilan = ()=>{
        Preloader.open("Récupération des données...");
        const type = Object.keys(METER_TYPES)[0];
        Promise.all([
            new Promise((resolve)=>{
                if(!meterRef.current){
                    getMetersListFromType(METER_TYPES[type]).then((m)=>{
                        m.map((_)=>{
                            if(isObj(_) && _.name =="A_80_LOCBABA"){
                                meterRef.current = _;
                                return;
                            }
                        });
                        if(!meterRef.current){
                            meterRef.current = m[0];
                        }
                    }).finally(()=>{
                        resolve(meterRef.current);
                    })
                } else {
                    resolve(meterRef.current);
                }
            }),
            new Promise((resolve,reject)=>{
                sendBilanMessage({
                    dateStart : startPeriodRef.current,
                    dateEnd : endPeriodRef.current,
                }).then(({payload:{value}})=>{
                    resolve({energies:Array.isArray(value)? value : []})
                }).catch((e)=>{
                    notify.error(e);
                    resolve({});
                })
            })
        ]).then(([meter,state])=>{
            setState({...state,isLoading:false})
        }).finally(()=>{
            Preloader.close();
        })
    }
    React.useEffect(()=>{
        setTimeout(refreshBilan,1000);
    },[]);
    const setDates = ()=>{
        DialogProvider.open({
            title :"Période d'exécution de la requête",
            subtitle : false,
            fields : {
                startPeriod : {
                    type : "datetime",
                    defaultValue : startPeriodRef.current,
                    label : 'Période de début',
                },
                endPeriod : {
                    type : "datetime",
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
        <View>
            <Grid testID={testID+"_Grid"}>
                {Object.mapToArray(METER_TYPES,(type,t)=>{
                    return <Cell key={t} tabletSize={6} style={[{maxHeight:'100%'}]} desktopSize={4} phoneSize={12} smallPhoneSize={12}>
                        <EnergySumaryItem
                            data = {values[t]}
                            meterType = {type}
                        />
                    </Cell>
                })}
            </Grid>
        </View>
        <Grid>
            <Cell tabletSize={12} desktopSize={8} phoneSize={12}>
                <Surface>
                    <LoadCurveScreen
                        withScreen = {false}
                        meter = {meterRef.current}
                        startDate = {startPeriodRef.current}
                        endDate = {endPeriodRef.current}
                    />
                </Surface>
            </Cell>
            <Cell tabletSize={6} desktopSize={4} phoneSize={12}>
                <Surface elevation={10} style={[theme.styles.p1,theme.styles.mt0,theme.styles.w100,theme.styles.mv1]} >
                    <Label textBold style={[theme.styles.w100,theme.styles.fs18,theme.styles.pv05,{textAlign:'center'}]}>
                        Classement Consommation
                    </Label>
                    <ScrollView vertical testID={testID+"_ScrollView"}>
                        {Object.mapToArray(METER_TYPES,(type,code)=>{
                            const tId = testID+"_MeterByTypes_"+code;
                            return <View style={[theme.styles.w100]} key={code} testID={tId}>
                                <Button color={type.color} upperCase={false} contentStyle={[theme.styles.justifyContentFlexStart]} icon={type.icon} testID={tId+"_Label"} style={[theme.styles.w100]}>
                                    {type.label}
                                </Button>
                                <Divider style={[theme.styles.w100]}/>
                                <View style={[theme.styles.w100,theme.styles.ph05]}>
                                    {Object.mapToArray(metersByTypes[code],(values,meter)=>{
                                        const canal = "canal"+(type.incoming ? "1" : type.outgoing ? "2" : "3"); 
                                        const value = defaultNumber(values[canal]);
                                        return <React.Fragment key={code+meter}>
                                            <View style={[theme.styles.flexWrap,theme.styles.row,theme.styles.w100,theme.styles.justifyContentSpaceBetween]}>
                                                <Button key={code+meter} color={theme.colors.text} style={[theme.styles.w100]} iconBefore={true} icon={meterIcon} contentStyle={[theme.styles.justifyContentFlexStart]}>
                                                    {meter}
                                                </Button>
                                                <Label style={[theme.styles.pl05]} textBold primary>{value.formatNumber()+" kwh"}</Label>
                                            </View>
                                            <Divider style={[theme.styles.w100]}/>
                                        </React.Fragment>
                                    })}
                                </View>
                            </View>
                        })}
                    </ScrollView>
                </Surface>
            </Cell>
        </Grid>
        <Fab
            icon = "calendar"
            visible
            actions ={[
                {
                    text : "Actualiser",
                    icon : "refresh",
                    error  : true,
                    onPress : refreshBilan,
                    title : "Bilan énergetique sur la période : "+periodeTitle,
                },
                {
                    text : "Modifier période",
                    icon : "calendar",
                    onPress : setDates,
                    secondary : true,
                }
            ]}
        />
        <DialogProvider ref={dialogRef}/>
    </View>;
}
const styles = StyleSheet.create({
    date : {
        width : 140,
    }
});
