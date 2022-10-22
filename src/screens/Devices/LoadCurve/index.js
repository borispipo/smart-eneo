import {isObj,isNonNullString,isArray} from "$utils";
import { useSocket } from "$socket";
import DateLib from "$lib/date";
import Preloader from "$preloader";
import notify from "$notify";
import DatePicker from "$ecomponents/Date";
import Provider from "$ecomponents/Dialog/Provider";
import Auth from "$cauth";
import Icon from "$ecomponents/Icon";
import View from "$ecomponents/View";
import i18n from "$i18n";
import TextField from "$ecomponents/TextField";
import Label from "$ecomponents/Label";
import Screen from "$screen";
import { LOAD_CURVE  as screenName} from "../routes";
import {getScreenProps} from "$cnavigation";
import theme from "$theme";
import Chart from "$chart";
import React from "$react";
import { DEFAULT_START_PERIOD,DEFAULT_END_PERIOD } from "$socket/utils";

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
const defaultParsedFormat = "JJ/MM/YYYY HH:MM";

export const getDateComponent = ({onChange,label,defaultValue,...props},ref)=>{
    return <DatePicker
        {...props}
        mode = "datetime"
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
export default function LoadCurveScreen(p){
    let {meter,testID,...props} = getScreenProps(p);
    const [state,setState] = React.useState({
        loadCurve : null,
        hasError : false,
        hasLoad : false,
        isInitialized : false,
    });
    const dateStartRef = React.useRef(defaultStartPeriod);
    const dateEndRef = React.useRef(defaultEndPeriod);
    testID = defaultStr(testID,"RN_LoadCurveScreen");
    meter = defaultObj(meter);
    const chartDateFormatRef = React.useRef(defaultStr(Auth.getSessionData(CHART_DATE_SESSION_FORMAT),defaultDisplayFormat))
    const prevMeter = React.usePrevious(meter);
    const isValidMeter = isNonNullString(meter.name) && meter.gaId ? true : false;
    const {name,gaId} = meter;
    const {sendLoadCurveMessage,getLogicalNames} = useSocket();
    const opts = {
        gaId,
        deviceName : name,
        logicalNames : getLogicalNames(),
    };
    const getLoadCurve = ()=>{
        if(!isValidMeter) return;
        const op = {...opts, dateStart : dateStartRef.current,dateEnd : dateEndRef.current};
        if(op.dateStart && !op.dateEnd || (op.dateEnd && !op.dateStart)){
            notify.error("Vous devez spéficier à la fois la péroide de début et de fin");
            return null;
        }
        Preloader.open("chargement de la courbe de charge pour le compteur ["+meter.name+"]...");
        return sendLoadCurveMessage(op).then((r)=>{
            const {hasError,error,payload} = r;
            if(hasError){
                notify.error(error);
            }
            setState({...state,isInitialized:true,hasLoad:true,hasError,loadCurve:!hasError?payload : state.loadCurve});
        }).catch((e)=>{
            console.log(e," is notifyffff")
            notify.error(e);
        }).finally(()=>{
            Preloader.close();
        });
    }
    
    let content = null;
    const {loadCurve} = state;
    if(isValidLoadCurve(loadCurve)){
        const {periodEnd : endDate, periodStart:startDate,value} = loadCurve;
        const xaxis = [], series = [];
        Object.map(LOAD_CURVE_SERIES,(s,v)=>{
            series.push(Object.clone(s));
        })
        for(let i = 1; i < value.length; i++){
            const v = value[i];
            if(!isValidLoadCurveData(v)) break;
            let date = {};
            try {
                date = new Date(v[0]);
                if(!date) continue;
                const d = DateLib.format(date,chartDateFormatRef.current);
                ///console.log(d," is dheinn")
                if(!d) continue;
                xaxis.push(d);////on prend la période de données
                series.map((s)=>{
                    const v1 = parseFloat(v[s.loadCurveIndex]) || 0;
                    s.data.push(v1);
                });
            } catch(e){
                console.log(e," is catching heinnn")
            }
        }
        content = <Chart
            height = {400}
            type = "line"
            series = {series}
            options = {{
                xaxis : {
                    categories : xaxis,
                }
            }}
        />
    }
    React.useEffect(()=>{
        if((meter.name === prevMeter.name)) return;
        dateStartRef.current = defaultStartPeriod;
        dateEndRef.current = defaultEndPeriod;
        getLoadCurve();
    },[meter])
    React.useEffect(()=>{
        getLoadCurve();
    },[]);
    const startDateC = getDateComponent({
        label : i18n.lang("start_period"),
        defaultValue : dateStartRef.current,
    },dateStartRef), 
    endDateC = getDateComponent({
        label : i18n.lang("end_period"),
        defaultValue : dateEndRef.current,
    },dateEndRef);
    const hasDate = dateStartRef.current || dateEndRef.current? true : false;
    const startDateStr = DateLib.isObj(dateStartRef.current)? dateStartRef.current.toFormat(LOAD_CURVE_DATA_LENGTH) : defaultStr(dateStartRef.current),
          endDateStr = DateLib.isObj(dateEndRef.current)? dateEndRef.current.toFormat(LOAD_CURVE_DATA_LENGTH) : defaultStr(dateEndRef.current);
    const endIcon = <Icon icon="cog" onClick={(e)=>{
        React.stopEventPropagation(e);
        Provider.open({
            title : "Paramètres",
            actions : [{
                icon : 'check',
                text : "Enregistrer",
                onClick : (args)=>{
                    Auth.setSessionData(CHART_DATE_SESSION_FORMAT,chartDateFormatRef.current);
                    Provider.close();
                    getLoadCurve();
                }
            }],
            content : <View style={{height:'300px',padding:10}}>
                <Label>
                    Format d'affichage des données du graphe : exemple : dd/mm/yyyy HH:MM:ss avec 
                    <Label> d : Jour, m: Mois, H : heure, M:minute, s : Séconde</Label>
                </Label>
                <TextField defaultValue={chartDateFormatRef.current} 
                    onChange = {({value})=>{
                        chartDateFormatRef.current = value;
                    }}
                    label={"Format"}>

                </TextField>
            </View>
        });
        console.log(e," is cliqueeee")
    }}/>
    return <Screen 
        {...props}
        appBarProps = {{actions :[
            {
                icon : 'refresh',
                onPress : getLoadCurve,
                text : 'Actualiser'
            }]}}
        title={"Courbe des charges "+(isValidMeter?(" ["+meter.name+"]"):"")} >
        {isValidMeter ?<View style={[theme.styles.row,theme.styles.p1,theme.styles.flexWrap]}>
            <Label>Courbe des charge associée au compteur {" ["}</Label>
            <Label textBold>{name}] {" "}</Label>
            {hasDate ? <>
                {startDateStr && dateEndRef.current ? <><Label>
                    pour la période allant du </Label><Label textBold>{startDateStr+" "}au{" "+endDateStr}</Label>
                </>:null}  
                {startDateStr && !dateEndRef.current ? <>
                    <Label>Depuis le</Label> <Label textBold>{" "+startDateStr}</Label>
                </>:<Label></Label>}
                {!startDateStr && dateEndRef.current ? <>
                    <Label>jusqu'au </Label><Label textBold> {" "+endDateStr} </Label>
                </>:<Label></Label>}
            </>:null}
        </View> : null}
        <View>
            {content}
        </View>
    </Screen>
}

LoadCurveScreen.screenName = screenName;