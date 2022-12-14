// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {isObj,isNonNullString,sanitizeFileName,getFileName,defaultVal,isArray} from "$utils";
import { useSocket } from "$socket";
import DateLib from "$lib/date";
import Preloader from "$preloader";
import notify from "$notify";
import DateTime from "$ecomponents/Date/DateTime";
import Auth from "$cauth";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import Button from "$ecomponents/Button";
import Datagrid from "$ecomponents/Datagrid";
import Icon,{MENU_ICON} from "$ecomponents/Icon";
import fetch from "$capi";
import { fields } from "./utils";
import {ScrollView} from "react-native";

import Menu from "$ecomponents/Menu";
import theme from "$theme";
import Chart from "$chart";
import React from "$react";
import { DEFAULT_START_PERIOD,DEFAULT_END_PERIOD } from "$socket/utils";
import PeriodSelector from "./PeriodSelector";

const CHART_DATE_SESSION_FORMAT = "CHART_DATE_SESSION";

const defaultStartPeriod = DEFAULT_START_PERIOD;
const defaultEndPeriod = DEFAULT_END_PERIOD;
/**** les entêtes des courbes de charges */
const LOAD_CURVE_HEADERS = ['Period', 'Canal 1 (kWh)', 'Canal 2 (kWh)', 'Canal 3 (kvarh)', 'Canal 4 (kvarh)', 'Evenements'];
//const LOAD_CURVE_PERIOD_INDEX = 0;
//const LOAD_CURVE_POWERS_INDEXES = [1,2,3,4];
const LOAD_CURVE_DATA_LENGTH = 6;
const LOAD_CURVE_SERIES = [];
for(let i = 1; i < LOAD_CURVE_HEADERS.length-1;i++){
    LOAD_CURVE_SERIES.push({
        name : LOAD_CURVE_HEADERS[i],
        loadCurveIndex : i,
        data : [],
    });
}


export const isValidLoadCurve = (loadCurve)=>{
    return isObj(loadCurve) && isNonNullString(loadCurve.periodEnd) && 
    isNonNullString(loadCurve.periodStart) && isArray(loadCurve.value) 
    && isArray(loadCurve.value[0]) && loadCurve.value[0].length === LOAD_CURVE_DATA_LENGTH ? true : false;
}
export const isValidLoadCurveData = (value)=>{
    return isArray(value) && value.length == LOAD_CURVE_DATA_LENGTH? true : false;
}

const defaultDisplayFormat = "dd/mm/yyyy HH:MM";

export const getDateComponent = ({onChange,label,defaultValue,...props},ref)=>{
    return <DateTime
        {...props}
        label = {label}
        defaultValue = {defaultValue}
        onChange = {(args)=>{
            const {value}= args;
            if(ref && 'current' in ref){
                ref.current = value;
            }
            if(onChange){
                onChange(args);
            }
        }}
    />
}
const LoadCurveLayout = React.forwardRef(({meter,testID,displayTable:customDisplayTable,withPeriodSelector,periodSelectorProps,editActionProps,refreshActionProps,onRefreshPeriod,startDate:startDatePeriod,endDate:endDatePeriod},ref)=>{
    const [state,setState] = React.useState({
        loadCurve : null,
        hasError : false,
        hasLoad : false,
        isInitialized : false,
        displayTable : typeof customDisplayTable =='boolean'? customDisplayTable : false,
    });
    startDatePeriod = defaultVal(startDatePeriod,defaultStartPeriod);
    endDatePeriod = defaultVal(endDatePeriod,defaultEndPeriod);
    const startDateRef = React.useRef(startDatePeriod);
    const endDateRef = React.useRef(endDatePeriod);
    testID = defaultStr(testID,"RN_LoadCurveLayout");
    meter = defaultObj(meter);
    meter.name = defaultStr(meter.name);
    const prevMeterName = React.usePrevious(meter.name);
    const chartDateFormatRef = React.useRef(defaultStr(Auth.getSessionData(CHART_DATE_SESSION_FORMAT),defaultDisplayFormat))
    const prevMeter = React.usePrevious(meter);
    const isValidMeter = isNonNullString(meter.name) && meter.gaId ? true : false;
    const {name,gaId} = meter;
    const {sendLoadCurveMessage,toggleActivityMessage,downloadLoadCurve,getLogicalNames} = useSocket();
    const opts = {
        gaId,
        deviceName : name,
        logicalNames : getLogicalNames(),
    };
    periodSelectorProps = defaultObj(periodSelectorProps);
    const hasDate = startDateRef.current || endDateRef.current? true : false;
    const startDateStr = DateLib.isValid(startDateRef.current)?startDateRef.current.toFormat(LOAD_CURVE_DATA_LENGTH):startDateRef.current,
          endDateStr = DateLib.isValid(endDateRef.current)? endDateRef.current.toFormat(LOAD_CURVE_DATA_LENGTH):endDateRef.current;
    
    const refresh = ()=>{
        if(!isValidMeter) return;
        const op = {...opts, dateStart : startDateRef.current,dateEnd : endDateRef.current};
        if(op.dateStart && !op.dateEnd || (op.dateEnd && !op.dateStart)){
            notify.error("Vous devez spéficier à la fois la péroide de début et de fin");
            return null;
        }
        Preloader.open("chargement de la courbe de charge pour le compteur ["+meter.name+"]...");
        toggleActivityMessage(true);
        return sendLoadCurveMessage(op).then((r)=>{
            const {hasError,error,payload} = r;
            if(hasError){
                notify.error(error);
            }
            setState({...state,isInitialized:true,hasLoad:true,hasError,loadCurve:!hasError?payload : state.loadCurve});
        }).catch((e)=>{
            notify.error(e);
        }).finally(()=>{
            toggleActivityMessage(false,true);
        });
    }
    
    let content = null;
    const {loadCurve,displayTable} = state;
    let sheetName = loadCurve?.sheetName;
    const downloadSHeetAction = sheetName && {
        text:"Télécharger",
        icon: "download",
        onPress :()=>{
            downloadLoadCurve(sheetName,{
                fileName : sanitizeFileName("{0} du {1} au {2}".sprintf(getFileName(sheetName,true),startDateStr,endDateStr))
            });
        }   
    };
    const changeDisplayType = true ? null : {
        icon : displayTable ? "chart-line" :"table-large",
        text : displayTable ? "Graphique": "Tableau",
        tooltip : displayTable ? "Cliquez pour afficher le contenu en graphe":"Cliquez pour afficher le contenu en tableau",
        info : true,
        onPress  : ()=>{
            setTimeout(()=>{
                setState({...state,displayTable:!displayTable});
            },200);
        }
    };
    let format = "dd/mm/yyyy HH:MM", startDateValue, endDateValue = null;
    const formatRef = React.useRef(format);
    if(isValidLoadCurve(loadCurve)){
        const {value} = loadCurve;
        const xaxis = [], series = [],tableData = [];
        Object.map(LOAD_CURVE_SERIES,(s,v)=>{
            series.push(Object.clone(s));
        })
        formatRef.current = format;
        for(let i = 1; i < value.length; i++){
            const v = value[i];
            if(!isValidLoadCurveData(v)) break;
            const tData = {};
            let date = {};
            try {
                date = new Date(v[0]);
                if(!date || !DateLib.isValid(date)) continue;
                tData.date = new Date(date);
                const d = date.toFormat(formatRef.current);
                if(!d) continue;
                series.map((s)=>{
                    const v1 = parseFloat(v[s.loadCurveIndex]) || 0;
                    if(false && !displayTable){
                        s.data.push(v1);
                    } else {
                        tData[s.name] = v1;
                    }
                });
                if(true || displayTable){
                    tData.period = new Date(date);//.toFormat("HH:MM");
                    tableData.push(tData);
                } else {
                    xaxis.push(d);////on prend la période de données
                    
                }
            } catch(e){
                console.log(e," is catching heinnn")
            }
        }
        content = displayTable || true ? <Datagrid
                data = {tableData}
                columns = {fields}
                sessionName = {meter.name}
                sectionListColumns = {['period']}
                /*getSectionListHeader = {({data})=>{
                    return data.date && data.date?.toFormat ? data.date.toFormat("dd/mm/yyyy"): null;
                }}*/
                customMenu = {[changeDisplayType,downloadSHeetAction]}
                showActions = {false}
                filterable = {false}
                selectable  = {false}
                onRefreshDatagrid = {()=>{
                    refresh();
                }}
                displayType = {"lineChart"}
                fetchData = {undefined}
                chartConfig = {{x:"period",y:"Canal 1 (kWh)"}}
            />: <Chart
            options = {{
                series,
                chart : {
                    height : 400,
                    type : "line",
                },
                //@see : https://apexcharts.com/docs/options/xaxis/
                xaxis : {
                    categories : xaxis,
                    axisTicks : {
                        height : 2
                    },
                    //type: 'datetime',
                    /*labels: {
                        //format : formatRef.current,
                        formatter: function (value, timestamp) {
                            return new Date(timestamp).toFormat(formatRef.current) // The formatter function overrides format property
                        } 
                    }*/
                },
                toolbar : {
                    tools : {
                        customIcons: [{
                            html: '<i class="fa fa-angle-down"></i>',
                            onClick: (e)=>{
                                console.log("presseddddddd ",e)
                            },
                            appendTo: 'left' // left / top means the button will be appended to the left most or right most position
                        }]
                    }
                }
            }}
        />
    }
    React.useEffect(()=>{
        if((startDatePeriod == defaultStartPeriod || endDatePeriod == defaultEndPeriod) && (!prevMeterName || prevMeterName == meter.name)) return;
        if((meter.name === prevMeter.name && (startDatePeriod == startDateRef.current) && (endDatePeriod == endDateRef.current))) return;
        startDateRef.current = startDatePeriod;
        endDateRef.current = endDatePeriod;
        refresh();
    },[meter,startDatePeriod,endDatePeriod])
    React.useEffect(()=>{
        refresh();
    },[]);
    React.setRef({
        refresh,
    });

    return <>
        {isValidMeter && !displayTable ?<View style={[theme.styles.row,theme.styles.p1,theme.styles.flexWrap]}>
            <Label>Courbe des charge associée au compteur {" ["}</Label>
            <Label textBold>{name}] {" "}</Label>
            {hasDate ? <>
                {startDateStr && endDateRef.current ? <><Label>
                    pour la période allant du </Label><Label textBold>{startDateStr+" "}au{" "+endDateStr}</Label>
                </>:null}  
                {startDateStr && !endDateRef.current ? <>
                    <Label>Depuis le</Label> <Label textBold>{" "+startDateStr}</Label>
                </>:<Label></Label>}
                {!startDateStr && endDateRef.current ? <>
                    <Label>jusqu'au </Label><Label textBold> {" "+endDateStr} </Label>
                </>:<Label></Label>}
               
                

               
            </>:null}
            {false ? <Menu  anchor = {
                    (props)=> <Icon icon = {MENU_ICON} {...props} /> 
                } items ={[
                   downloadSHeetAction,
                   changeDisplayType,
                ]}/>:null}
        </View> : null}
        <View>
            {content}
        </View>
        {withPeriodSelector !== false ? <PeriodSelector
            meter={meter}
            startDateValue = {startDateValue}
            endDateValue = {endDateValue}
            editActionProps={{
                text : "Modifier la période {0}".sprintf(meter.name && ("["+meter.name+"]") || ''),
                ...defaultObj(editActionProps)
            }}
            refreshActionProps={{
                text : "Actualiser {0}".sprintf(meter.name && ("["+meter.name+"]") || ''),
                ...defaultObj(refreshActionProps)
            }}
            {...periodSelectorProps}
            startDate = {startDateRef.current}
            endDate = {endDateRef.current}
            onRefresh={(args)=>{
                if(typeof onRefreshPeriod =='function' && onRefreshPeriod(args) === false){
                    return;
                } else if(typeof periodSelectorProps.onRefresh =='function' && periodSelectorProps.onRefresh(args) ===false) return;
                const {startDate,endDate} = args;
                startDateRef.current = startDate;
                endDateRef.current = endDate;
                refresh();
            }}
        /> : null}
    </>
});


export default LoadCurveLayout;

LoadCurveLayout.PeriodSelector = PeriodSelector;