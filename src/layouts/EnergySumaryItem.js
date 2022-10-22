// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import Icon from "$ecomponents/Icon";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import Button from "$ecomponents/Button";
import PropTypes from "prop-types";
import Surface from "$ecomponents/Surface";
import theme,{Colors} from "$theme";
import {isObj,defaultStr} from "$utils";
import Divider from "$ecomponents/Divider"

export default function EnergySumaryItemLayout({data,testID,meterType,color,...props}){
    testID = defaultStr(testID,'EnergySumaryItem');
    color = Colors.isValid(color)? color : meterType.color;
    return <Surface elevation={5} style={[theme.styles.w100,theme.styles.ph1,theme.styles.pb1,{borderTopColor:color,borderTopWidth:3}]} testID={testID}>
        <Button color={color} contentProps={{style:[theme.styles.justifyContentFlexStart,theme.styles.w100]}} textBold upperCase = {false} iconBefore={true} noPadding icon={meterType.icon}>
            Energie {meterType.label}
        </Button>
        <Divider style={theme.styles.w100}/>
        <View testID={testID+"_Details"}>
            {isObj(data) ? Object.mapToArray(data,(d,i)=>{
                return <Button upperCase={false} textBold contentStyle={theme.styles.justifyContentFlexStart} key={i} textBold left={x=><Label>{i+" : "}</Label>}>
                    {d.formatNumber()+" kwh"}
                </Button>
            }):null}
        </View>
    </Surface>
}
EnergySumaryItemLayout.propTypes = {
    meterType : PropTypes.shape({
        label : PropTypes.string.isRequired,
        icon : PropTypes.string.isRequired,
    }).isRequired,
    data : PropTypes.object,
}