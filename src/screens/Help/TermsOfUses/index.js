import View from "$ecomponents/View";
import {TERMS_OF_USES} from "./routes";
import title from "./title";
import { GROUP_NAMES } from "$escreens/utils";
import Label from "$ecomponents/Label";
import Screen from "$screen";

export default function TermsOfUses(props){
    const {options} = props;
    return <Screen 
        {...props}
        withDrawer = {false}
        options = {options}
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
                Vous verez les terms of Uses hein
            </Label>
        </View>
    </Screen>
}


TermsOfUses.screenName = TERMS_OF_USES;

TermsOfUses.groupName = "PUBLIC";

TermsOfUses.Modal = true;
