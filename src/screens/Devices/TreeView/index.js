import Button from "$ecomponents/Button";
import Icon from "$ecomponents/Icon";
import TreeItem from "./TreeItem";
import Avatar from "$ecomponents/Avatar";
import theme,{Colors,ALPHA} from "$theme";
import {METER_TYPES,getMetersCount} from "$database/data/devices";
import View from "$ecomponents/View";
import i18n from "$i18n";
import Expandable from "$ecomponents/Expandable";
import React from "$react";
import {iconSize as size,meterIcon} from "./utils";

export default function DevicesTreeViewContainer({component,children,...props}){
    const buttonRef = React.useRef(null);
    const [state,setState] = React.useState({
        expanded : false, 
        data : [], count : 0,
    });
    const setIsLoading = Loading => buttonRef.current && buttonRef.current.setIsLoading ? buttonRef.current.setIsLoading(Loading) : null;
    
    const countMeters = (expanded)=>{
        return getMetersCount().then((count)=>{
            setState({...state,count,expanded:typeof expanded=='boolean'? expanded:state.expanded});
        }).catch(e=>{
            console.log(e," getting meter count")
            setState({...state,count:0,expanded:typeof expanded=='boolean'? expanded:state.expanded});
        })
    }
    const handleOnIconPress = (e)=>{
        if(!state.count) return countMeters(false);
        setState({...state,expanded:!state.expanded});
    }
    React.useEffect(()=>{
        countMeters();
    },[]);
    const alphaColor = Colors.setAlpha(theme.colors.text,ALPHA);
    return <>
            <Expandable
                {...props}
                ref = {buttonRef}
                expandIconProps = {{size,style:[theme.styles.noPadding,theme.styles.noMarging]}}
                testID= {"RN_ExpandableMetersContainer"}
                expanded = {state.expanded}
                containerProps = {{...defaultObj(props.containerProps),style:[theme.styles.w100,props.style]}}
                onPress = {handleOnIconPress}
                title = {<Button  
                    contentProps = {{style:{justifyContent:'flex-start'}}} 
                    mode = {"text"}
                    color={state.expanded?theme.colors.primary:alphaColor} 
                    style={[theme.styles.w100,theme.styles.pt05,theme.styles.pb05]} 
                    left = {(props)=>{
                        return <Icon {...props} size={size} style={[props.style,{width:size,height:size},theme.styles.noPadding]} icon={meterIcon}/>
                    }}
                    labelStyle = {[theme.styles.pr1]}
                >
                    {i18n.lang("meters")}
                </Button>}
                right = {(props)=>{
                    return <Avatar {...props} primary
                        onPress = {handleOnIconPress}
                        size = {size}
                        label = {state.count}
                        title = {state.count}
                    />
                }}
            >
                {Object.mapToArray(METER_TYPES,(type,key)=>{
                    return <View key={key} style={{marginLeft:12}}>
                        <TreeItem 
                            type = {type}
                        />
                    </View>
                })}
            </Expandable>
        </> 
}