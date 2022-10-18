import date from "./date";
import validator from "./validator";

export const i18nEnLang = {
    en : {
        ...date,
        ...validator, 
        ...require("./auth"),
        home : 'Home',
        settings : 'Settings',       
        no:'No',
        yes : 'Yes',
        do_you_really_want_to_delete : 'Do you really want to delete?',
        name : 'Name',
        remove : 'Remove',
        language : 'Language',
        choose_your_language : 'Please select application language',
        close: 'Close'
        ,edit_title : 'Edit Title',
        search : 'Search',
        selected : 'Selected',
        'checked' : 'Checked',
        'unchecked' : 'Unchecked',
        and : 'and',
        characters : 'characters',
        
        enabled : 'Enabled',
        disabled : 'Disabled',
        msg_box : 'Message Box',
        
        dashboard : 'Dashboard',
        country : 'Country',
        countries : 'Countries',
        browse_url : 'Browse Url',
        loading : 'loading',
        no_filter : "No Filter",

        update : "Update",
        windows : "Windows",
        'save' : 'Save',
        save_title : 'Save Title',
        'update' : 'Update',
        'cancel' : 'Cancel',
        'checkbox_grid' : 'Select box',
        minimize_all_window : 'minimize all',
        open_all_window : 'Display all',
        reset_window_display : "Affichage par défaut",
        'click_to_browse_image': 'Click to browse image',
        click_to_empty_value_field :'Click to empty this field'
        ,  open_link_in_target: 'Please check this box to enable link open in window on click',
        refresh : 'Refresh',
        add_new : 'Add new',
        please_check_your_network : 'Ouff!! Internet problems? Your internet connection seems to be unstable. Please check your internet settings before trying to access the requested resource again.',
    }
}

