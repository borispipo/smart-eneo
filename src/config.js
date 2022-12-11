/**** les  paramètres statiques de configuration de l'application*/
const appId = 'com.ftc.apps.device.smarteneo';
const config = {
    name : "SmartEEM",//le nom de l'application,
    description : "Suivi des équipements Eneo",
    version : "1.0.0",
    /*** l'environnement d déploiement de l'apps 
     *  production | development | test
    */
    env : "development",
    realeaseDateStr : "1er Juin 2021",
    releaseDate : "2020-05-23",
    devMail : "smart-eneo@gmail.com",
    devWebsite : "http://fto-consulting.com/smart-eneo/",
    copyRight : "FirsTo consulting@Août 2022",
    author : 'firsto consulting',
    id : appId,//l'unique id de l'application,
    appId,
    /****la version de l'api next côté serveur actuellement déployée */
    apiVersion : "1.0", 
    includeCredentialsOnApiFetch : false,
    theme : {
        light : {
            //primary : "#00AB55",
            primary  : "#00AB55",
            secondary : "#354448",
        }
    },
    /***NetInfo */
    netInfoReachabilityShortTimeout : 30000,
}

module.exports = config;