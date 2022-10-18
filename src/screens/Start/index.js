import {START} from "./routes";
import Content from "./content"
import {getName} from "$app";
export default function Start(props){
    return <Content 
        {...props}
    />
}

Start.screenName = START;

Start.Modal = true;

Start.Start = true;

export const routeName = START;

Start.options = {
    title:getName(),
    headerShown : false,
    allowDrawer : false,
}

