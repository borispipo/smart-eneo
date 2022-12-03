import UNITS from "./units";
import TYPES from "./types";

export const METER_NUMBER = {
    code : "0.0.96.1.0.255",
    desc: 'Numéro compteur',
    shortDesc : "N° compteur",
    isOject : true,
    displayInSettings : true,
    displayInHome : false, //si l'on pourra affichera à l'interface d'acceuil d'un compteur
    name : 'METER_NUMBER',
    type : TYPES.NUMBER,
    unit : UNITS.NONE,
};

export const TRANSFORMER_RATIO_CURRENT_NUMERATOR = {
    code : "1.1.0.4.2.255",
    isOject : true,
    desc: 'Transformer ratio - current (numerator)',
    shortDesc : "TRC(N)",
    name : 'TRANSFORMER_RATIO_CURRENT_NUMERATOR',
    type : TYPES.NUMBER,
    unit : UNITS.NONE,
};

export const TRANSFORMER_RATIO_CURRENT_DENOMINATOR = {
    code : "1.1.0.4.5.255",
    isOject : true,
    desc: 'Transformer ratio - current (denominator)',
    shortDesc : "TRC(D)",
    name : 'TRANSFORMER_RATIO_CURRENT_DENOMINATOR',
    type : TYPES.NUMBER,
    unit : UNITS.NONE,
};


export const TRANSFORMER_RATIO_VOLTAGE_NUMERATOR = {
    code : "1.1.0.4.3.255",
    isOject : true,
    desc: 'Transformer ratio - voltage (numerator)',
    shortDesc : "TRV(N)",
    name : 'TRANSFORMER_RATIO_VOLTAGE_NUMERATOR',
    type : TYPES.NUMBER,
    unit : UNITS.NONE,
};

export const TRANSFORMER_RATIO_VOLTAGE_DENOMINATOR = {
    code : "1.1.0.4.6.255",
    isOject : true,
    desc: 'Transformer ratio - voltage (denominator)',
    shortDesc : "TRV(D)",
    name : 'TRANSFORMER_RATIO_VOLTAGE_DENOMINATOR',
    type : TYPES.NUMBER,
    unit : UNITS.NONE,
};


export const POWER_FACTOR_INST = {
    code : '1.1.13.7.0.255',
    isOject : true,
    desc: 'Power factor Inst',
    shortDesc : "PFI",
    name : 'POWER_FACTOR_INST',
    type : TYPES.NUMBER,
    unit : UNITS.NONE,
};

export const ACTIVE_POWER_PLUS = {
    code : '1.1.1.8.0.255',
    isOject : true,
    desc: 'Active power+',
    shortDesc : "A+",
    name : 'ACTIVE_POWER_PLUS',
    type : TYPES.NUMBER,
    unit : UNITS.MEGA_WAR,
};

export const ACTIVE_POWER_MINUS = {
    code : '1.1.2.8.0.255',
    isOject : true,
    desc: 'Active power-',
    shortDesc : "A-",
    name : 'ACTIVE_POWER_MINUS',
    type : TYPES.NUMBER,
    unit : UNITS.MEGA_WAR,
};

export const ACTIVE_POWER_PLUS_INST = {
    code : '1.1.1.7.0.255',
    isOject : true,
    desc : "Active Power Plus Inst",
    shortDesc : "A+(I)",
    name : 'ACTIVE_POWER_PLUS_INST',
    type : TYPES.NUMBER,
    unit : UNITS.NONE,
    defaultValue : 1000000,
};

export const ACTIVE_POWER_MINUS_INST = {
    code : '1.1.2.7.0.255',
    isOject : true,
    name : 'ACTIVE_POWER_MINUS_INST',
    desc : "Active Power Minus Inst",
    shortDesc : "A-(I)",
    type : TYPES.NUMBER,
    unit : UNITS.MEGA_WAT,
    defaultValue : 1000000,
};

export const REACTIVE_POWER_PLUS_INST = {
    code : '1.1.3.7.0.255',
    isOject : true,
    name : 'REACTIVE_POWER_PLUS_INST',
    desc : "Reactive Power Plus Inst",
    shortDesc : "RA-(I)",
    type : TYPES.NUMBER,
    unit : UNITS.MEGA_WAR,
    defaultValue : 1000000,
};

export const REACTIVE_POWER_MINUS_INST = {
    code : '1.1.4.7.0.255',
    isOject : true,
    desc : "Reactive Power Minus Inst",
    shortDesc : "RA-(I)",
    name : 'REACTIVE_POWER_MINUS_INST',
    type : TYPES.NUMBER,
    unit : UNITS.MEGA_WAR,
    defaultValue : 1000000,
};
export const REACTIVE_POWER_PLUS = {
    name : "REACTIVE_POWER_PLUS",
    isOject : true,
    code:'1.1.3.8.0.255',
    type: TYPES.NUMBER, 
    desc: 'Reactive power+',
    shortDesc : "RA+", 
}
export const REACTIVE_POWER_MINUS = {
    name : "REACTIVE_POWER_MINUS",
    isOject : true,
    code:'1.1.4.8.0.255',
    type: TYPES.NUMBER, 
    desc: 'Reactive power-',
    shortDesc : "RA-", 
}
export const LOAD_CURVE_LOGICAL_NAME = {
    code : '0.0.99.1.0.255',
    isLoadCurve : true,
    name : 'LOAD_CURVE_LOGICAL_NAME',
    type : TYPES.ARRAY,
    unit : UNITS.ARRAY,
};