import Label from "$ecomponents/Label";
import React from "$react";
import APP from "$app";
import Screen from "$elayouts/Screen";
import View from "$ecomponents/View";
import EnergySumary from "$layouts/EnergySumary";


export const screenName = "HOME";


export default function Home (props){
    const [state,setState] = React.useState({});
    
    return <Screen {...props} 
        withScrollView
        testID = {"RN_MainScreenHome"}
    >
        <EnergySumary/>
    </Screen>
}

Home.screenName = screenName;

//Home.elevation = 0;

//Home.headerShown = false;

Home.options = {
    title : APP.getName()
}