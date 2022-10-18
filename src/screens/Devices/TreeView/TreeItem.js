
import PropTypes from "prop-types";
import Button from "$ecomponents/Button";
import React from "$react";
import {getMetersListFromType,getMetersCountFromType,METER_TYPES} from "$database/data/devices";
import Expandable from "$ecomponents/Expandable";
import MeterItem from "./MeterItem";
import Avatar from "$ecomponents/Avatar";
import theme,{Colors,ALPHA} from "$theme";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import {iconSize as size} from "./utils";
import Icon from "$ecomponents/Icon";

/*** cette classse permet de lister hierarchiquement la liste des devices associée à une ga passée en paramètre */
export default function MeterTypeTreeItemContainer (props){
    const {type} = props;
    const buttonRef = React.useRef(null);
    const [state,setState] = React.useState({
        meters : [],
        count : 0,
        expanded : false,
    });
    const fetchingMetersRef = React.useRef(false);
    const setIsLoading = Loading => buttonRef.current && buttonRef.current.setIsLoading ? buttonRef.current.setIsLoading(Loading) : null;
    const fetchMeters = ()=>{
        if(fetchingMetersRef.current) return;
        setIsLoading(true);
        fetchingMetersRef.current = true;
        getMetersListFromType(type.code).then((meters)=>{
            setState({...state,meters,expanded:meters.length ? true : false});
        }).catch((e)=>{
            console.log(e," is getign metter list of type ",type);
        }).finally(()=>{
            setIsLoading(false);
            fetchingMetersRef.current = false;
        });
    }
    const handleOnIconPress = (e)=>{
        React.stopEventPropagation(e);
        if(state.expanded){
            if(!state.meters.length){
                return fetchMeters();
            }
            setState({...state,expanded:false});
        } else {
            setState({...state, expanded:true});
        }
    }
    React.useEffect(()=>{
        getMetersCountFromType(type.code).then((count)=>{
            setState({...state,count});
        }).catch((e)=>{
            console.log(e," getting meter count hein")
        })
    },[])
    const alphaColor = Colors.setAlpha(theme.colors.text,ALPHA);
    return <Expandable
        containerProps = {{style:[theme.styles.w100]}}
        expanded = {state.expanded}
        expandIconProps = {{size,style:[theme.styles.noPadding,theme.styles.noMarging]}}
        onPress = {handleOnIconPress}
        left = {(p)=>{
            return type.icon ? <Icon {...p} icon={type.icon}  size={size} noPadding noMargin/> : null;
        }}
        title = {<Button 
            mode = {"text"}
            color={state.expanded?theme.colors.primary:alphaColor} 
            contentProps = {{style:{justifyContent:'space-between',paddingLeft:5,paddingVertical:5,marginRight:5}}} 
            style={[theme.styles.w100,theme.styles.pt05,theme.styles.pb05]} 
            ref = {buttonRef}
            onPress = {handleOnIconPress}
            right = {(props)=>{
                return <Avatar
                    {...props}
                    size = {size}
                    onPress = {handleOnIconPress}
                    label = {state.meters.length || state.count}
                />
            } }
        >
            {type.label+" ["+type.key+"]"}
        </Button>}
    >
        {state.meters.map((meter,i)=>{
            return <MeterItem
                key = {i}
                meter = {meter}
            />
        })}
    </Expandable>
}

MeterTypeTreeItemContainer.propTypes = {
    type : PropTypes.shape({
        code : PropTypes.string.isRequired,
        label : PropTypes.string.isRequired,
        key : PropTypes.string.isRequired
    }).isRequired
}