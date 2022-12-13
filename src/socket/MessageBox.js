// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import React from "$react";
import Portal from "$components/Portal";
import View from "$components/View";
import {StyleSheet} from "react-native";
import Label from "$components/Label";
import Dimensions from "$cdimensions";
import {defaultObj} from "$utils";
import Snackbar from '$ecomponents/Snackbar';
import theme from "$theme";

const MessageBox = React.forwardRef(({visible:customVisible,onReconnectPress,labelProps,children,...props},ref)=>{
    const [visible,setVisible] = React.useState(typeof customVisible =='boolean'?customVisible:true);
    const isInitializedRef = React.useRef(null);
    const prevVisible = React.usePrevious(visible);
    if(prevVisible !== visible){
        isInitializedRef.current = true;
    }
    const cbRef = React.useRef(null);
    labelProps = defaultObj(labelProps);
    const cb = cbRef.current;
    cbRef.current = null;
    const {width} = Dimensions.useWindowDimensions();
    React.useEffect(()=>{
        if(typeof customVisible ==='boolean' && customVisible !== visible){
            setVisible(customVisible);
        }
    },[customVisible])
    const context = {setVisible:(v)=>{
        if(typeof v =='boolean' && v !== visible){
            setVisible(v);
        }
    }};

    const onDismissSnackBar = () => setVisible(false)
    React.setRef(ref,context);
    React.useEffect(()=>{
        if(typeof cb =='function'){
            cb(context);
        }
        cbRef.current = null;
    },[visible])
    if(!React.isValidElement(children,true) || !children){
        children = isInitializedRef.current ? "Vous avez perdue la connection, tentative de reconnection en cours...." : 
        "Vous n'êtes pas connectés, tentative de connection en cours....";
    }
    
    return <View style={styles.container} testID={"RN_MessageBoxSocket"}>
            <Snackbar
                visible={visible}
                duration = {100000000000000000000}
                onDismiss={onDismissSnackBar}
                style  = {[styles.snak,{backgroundColor:theme.colors.error,color:theme.colors.errorText}]}
                action={{
                    label: 'Reconnecter',
                    icon : "connection",
                    color : theme.colors.errorText,
                    onPress: onReconnectPress,
                    contentProps : {style:[theme.styles.noPadding,theme.styles.noMargin]}
                }}
            >
                {children}
            </Snackbar>
        </View>
})

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
    },
    label: {
        //color: "white",
    },
    snak : {
        bottom : 40,
        justifyContent : "center",
        flexDirection : 'column',
        alignItems : 'center',
    },
    content: {
        //...StyleSheet.absoluteFill,
        bottom : 30,
        right : 0,
        //position : 'absolute',
        width : '100%'
    }
})

MessageBox.displayName = "MessageBox";
export default MessageBox;