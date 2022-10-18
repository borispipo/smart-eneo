import UNITS from "./units";
import TYPES from "./types";

export const METER_NUMBER = {
    code : "0.0.96.1.0.255",
    name : 'METER_NUMBER',
    type : TYPES.NUMBER,
    unit : UNITS.NONE,
};

export const TRANSFORMER_RATIO = {
    code : "1.1.0.4.2.255",
    name : 'TRANSFORMER_RATIO',
    type : TYPES.NUMBER,
    unit : UNITS.NONE,
};

export const POWER_FACTOR_INST = {
    code : '1.1.13.7.0.255',
    name : 'POWER_FACTOR_INST',
    type : TYPES.NUMBER,
    unit : UNITS.NONE,
};

export const ACTIVE_POWER_PLUS = {
    code : '1.1.1.8.0.255',
    name : 'ACTIVE_POWER_PLUS',
    type : TYPES.NUMBER,
    unit : UNITS.MEGA_WAR,
};

export const ACTIVE_POWER_MINUS = {
    code : '1.1.2.8.0.255',
    name : 'ACTIVE_POWER_MINUS',
    type : TYPES.NUMBER,
    unit : UNITS.MEGA_WAR,
};

export const ACTIVE_POWER_PLUS_INST = {
    code : '1.1.1.7.0.255',
    name : 'ACTIVE_POWER_PLUS',
    type : TYPES.NUMBER,
    unit : UNITS.NONE,
    defaultValue : 1000000,
};

export const ACTIVE_POWER_MINUS_INST = {
    code : '1.1.2.7.0.255',
    name : 'ACTIVE_POWER_MINUS',
    type : TYPES.NUMBER,
    unit : UNITS.MEGA_WAT,
    defaultValue : 1000000,
};

export const REACTIVE_POWER_PLUS_INST = {
    code : '1.1.3.7.0.255',
    name : 'ACTIVE_POWER_PLUS',
    type : TYPES.NUMBER,
    unit : UNITS.MEGA_WAR,
    defaultValue : 1000000,
};

export const REACTIVE_POWER_MINUS_INST = {
    code : '1.1.4.7.0.255',
    name : 'ACTIVE_POWER_MINUS',
    type : TYPES.NUMBER,
    unit : UNITS.MEGA_WAR,
    defaultValue : 1000000,
};

export const LOAD_CURVE_LOGICAL_NAME = {
    code : '0.0.99.1.0.255',
    name : 'LOAD_CURVE',
    type : TYPES.ARRAY,
    unit : UNITS.ARRAY,
};