import View from "$ecomponents/View";
import {PRIVACY_POLICY} from "./routes";
import title from "./title"
import Label from "$ecomponents/Label";
import  Screen  from "$screen";

export default function PrivacyPolicy(props){
    return <Screen 
        {...props}
        withDrawer = {false}
        appBarProps  = {{
            backAction : false,
            title,
            actions : [{
                text : "Accepter",
                icon : "check",
                onPress : ({goBack})=>{
                    goBack();
                }
            }]
        }}
    >
        <View>
            <Label>
                Ici les termes and conditioins, PrivacyPolicy
            </Label>
        </View>
    </Screen>
}


PrivacyPolicy.screenName = PRIVACY_POLICY;

PrivacyPolicy.groupName = "PUBLIC";

PrivacyPolicy.Modal = true;