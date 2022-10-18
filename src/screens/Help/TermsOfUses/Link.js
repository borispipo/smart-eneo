import Link from "$ecomponents/Link";
import {TERMS_OF_USES} from "./routes";
import theme from "$theme";
import title from "./title";
import Label from "$ecomponents/Label";
export default function(props){
    return <Link routeName={TERMS_OF_USES}>
        <Label {...props} style={[props.style,{color:theme.colors.primary,fontWeight:'bold',textDecorationLine:'underline'}]}>
            {props.children || title}
        </Label>
    </Link>
}