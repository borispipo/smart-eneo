export default {
    deletable : true,
    table : "tags", ////catégories de paiement
    desc : 'Il est possible d\'associer des étiquettes sur les ventes/achats/stocks/règlements, utilses pour les statistiques. les règlements de type ventes ont toujours l\'étiquette vente, les règlements d\'achats ont toujours l\'étiquette achats',
    text : "Etiquettes de ventes/achats/...",
    icon : 'tag',
    addIcon : "mdi-tag-plus",
    addIconTooltip : 'Nouvelle étiquette',
    fields : {
        code : {
            maxLength : 30,
            upper : false,
        },
        label : {
            label : 'Libelé',
            upper : false,
        },
    }
}