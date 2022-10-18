import Label from "$ecomponents/Label";
import React from "$react";
import APP from "$app";
import Screen from "$elayouts/Screen";
import {SelectCountry} from "$ecomponents/Countries";
import View from "$ecomponents/View";
import theme from "$theme";
import { TextInput } from "react-native";
import Table from "$ecomponents/Table";

export const screenName = "HOME";


export default function Home (props){
    React.useEffect(()=>{
    },[])
    return <Screen {...props} 
        testID = {"RN_MainScreenHome"}
    >
    </Screen>
}

Home.screenName = screenName;

//Home.elevation = 0;

//Home.headerShown = false;

Home.options = {
    title : APP.getName()
}