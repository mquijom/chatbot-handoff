'use strict'

var nationality = [
    { value: "PHL", desc: "Philippines" },
    { value: "AFG", desc: "Afghanistan" },
    { value: "ALB", desc: "Albania" },
    { value: "DZA", desc: "Algeria" },
    { value: "ASM", desc: "American Samoa" },
    { value: "AND", desc: "Andorra" },
    { value: "AGO", desc: "Angola" },
    { value: "AIA", desc: "Anguilla" },
    { value: "ATA", desc: "Antarctica" },
    { value: "ATG", desc: "Antigua and Barbuda" },
    { value: "ARG", desc: "Argentina" },
    { value: "ARM", desc: "Armenia" },
    { value: "ABW", desc: "Aruba" },
    { value: "AUS", desc: "Australia" },
    { value: "AUT", desc: "Austria" },
    { value: "AZE", desc: "Azerbaijan" },
    { value: "BHS", desc: "Bahamas" },
    { value: "BHR", desc: "Bahrain" },
    { value: "BGD", desc: "Bangladesh" },
    { value: "BRB", desc: "Barbados" },
    { value: "BLR", desc: "Belarus" },
    { value: "BEL", desc: "Belgium" },
    { value: "BLZ", desc: "Belize" },
    { value: "BEN", desc: "Benin" },
    { value: "BMU", desc: "Bermuda" },
    { value: "BTN", desc: "Bhutan" },
    { value: "BOL", desc: "Bolivia" },
    { value: "BES", desc: "Bonaire, Sint Eustatius, and Saba" },
    { value: "BIH", desc: "Bosnia and Herzegovina" },
    { value: "BWA", desc: "Botswana" },
    { value: "BVT", desc: "Bouvet Island" },
    { value: "BRA", desc: "Brazil" },
    { value: "IOT", desc: "British Indian Ocean Territory" },
    { value: "BRN", desc: "Brunei Darussalam" },
    { value: "BGR", desc: "Bulgaria" },
    { value: "BFA", desc: "Burkina Faso" },
    { value: "BDI", desc: "Burundi" },
    { value: "KHM", desc: "Cambodia" },
    { value: "CMR", desc: "Cameroon" },
    { value: "CAN", desc: "Canada" },
    { value: "CPV", desc: "Cape Verde" },
    { value: "CYM", desc: "Cayman Islands" },
    { value: "CAF", desc: "Central African Republic" },
    { value: "TCD", desc: "Chad" },
    { value: "CHL", desc: "Chile" },
    { value: "CHN", desc: "China" },
    { value: "CXR", desc: "Christmas Island" },
    { value: "CCK", desc: "Cocos (Keeling) Islands" },
    { value: "COL", desc: "Colombia" },
    { value: "COM", desc: "Comoros" },
    { value: "COG", desc: "Congo" },
    { value: "000", desc: "Congo, The Democratic Republic of" },
    { value: "COK", desc: "Cook Islands" },
    { value: "CRI", desc: "Costa Rica" },
    { value: "CIV", desc: "Cote Ivoire (Ivory Coast)" },
    { value: "HRV", desc: "Croatia (Hrvatska)" },
    { value: "CUB", desc: "Cuba" },
    { value: "CUW", desc: "Curacao" },
    { value: "CYP", desc: "Cyprus" },
    { value: "CZE", desc: "Czech Republic" },
    { value: "DNK", desc: "Denmark" },
    { value: "DJI", desc: "Djibouti" },
    { value: "DMA", desc: "Dominica" },
    { value: "DOM", desc: "Dominican Republic" },
    { value: "TMP", desc: "East Timor" },
    { value: "ECU", desc: "Ecuador" },
    { value: "EGY", desc: "Egypt" },
    { value: "SLV", desc: "El Salvador" },
    { value: "GNQ", desc: "Equatorial Guinea" },
    { value: "ERI", desc: "Eritrea" },
    { value: "EST", desc: "Estonia" },
    { value: "ETH", desc: "Ethiopia" },
    { value: "FLK", desc: "Falkland Islands (Malvinas)" },
    { value: "FRO", desc: "Faroe Islands" },
    { value: "FJI", desc: "Fiji" },
    { value: "FIN", desc: "Finland" },
    { value: "FRA", desc: "France" },
    { value: "GUF", desc: "French Guiana" },
    { value: "PYF", desc: "French Polynesia" },
    { value: "ATF", desc: "French Southern Territories" },
    { value: "GAB", desc: "Gabon" },
    { value: "GMB", desc: "Gambia" },
    { value: "GEO", desc: "Georgia" },
    { value: "DEU", desc: "Germany" },
    { value: "GHA", desc: "Ghana" },
    { value: "GIB", desc: "Gibraltar" },
    { value: "GBR", desc: "Great Britain (U.K.)" },
    { value: "GRC", desc: "Greece" },
    { value: "GRL", desc: "Greenland" },
    { value: "GRD", desc: "Grenada" },
    { value: "GLP", desc: "Guadeloupe" },
    { value: "GUM", desc: "Guam" },
    { value: "GTM", desc: "Guatemala" },
    { value: "GNB", desc: "Guinea-Bissau" },
    { value: "GUY", desc: "Guyana" },
    { value: "HTI", desc: "Haiti" },
    { value: "HMD", desc: "Heard and McDonald Islands" },
    { value: "HND", desc: "Honduras" },
    { value: "HKG", desc: "Hong Kong" },
    { value: "HUN", desc: "Hungary" },
    { value: "ISL", desc: "Iceland" },
    { value: "IND", desc: "India" },
    { value: "IDN", desc: "Indonesia" },
    { value: "IRN", desc: "Iran" },
    { value: "IRQ", desc: "Iraq" },
    { value: "IRL", desc: "Ireland" },
    { value: "ISR", desc: "Israel" },
    { value: "ITA", desc: "Italy" },
    { value: "JAM", desc: "Jamaica" },
    { value: "JPN", desc: "Japan" },
    { value: "JOR", desc: "Jordan" },
    { value: "KAZ", desc: "Kazakhstan" },
    { value: "KEN", desc: "Kenya" },
    { value: "KIR", desc: "Kiribati" },
    { value: "PRK", desc: "Korea (North)" },
    { value: "KOR", desc: "Korea (South)" },
    { value: "KWT", desc: "Kuwait" },
    { value: "KGZ", desc: "Kyrgyzstan" },
    { value: "LAO", desc: "Laos" },
    { value: "LVA", desc: "Latvia" },
    { value: "LBN", desc: "Lebanon" },
    { value: "LSO", desc: "Lesotho" },
    { value: "LBR", desc: "Liberia" },
    { value: "LBY", desc: "Libya" },
    { value: "LIE", desc: "Liechtenstein" },
    { value: "LTU", desc: "Lithuania" },
    { value: "LUX", desc: "Luxembourg" },
    { value: "MAC", desc: "Macau" },
    { value: "MKD", desc: "Macedonia" },
    { value: "MDG", desc: "Madagascar" },
    { value: "MWI", desc: "Malawi" },
    { value: "MYS", desc: "Malaysia" },
    { value: "MDV", desc: "Maldives" },
    { value: "MLI", desc: "Mali" },
    { value: "MLT", desc: "Malta" },
    { value: "MHL", desc: "Marshall Islands" },
    { value: "MTQ", desc: "Martinique" },
    { value: "MRT", desc: "Mauritania" },
    { value: "MUS", desc: "Mauritius" },
    { value: "MYT", desc: "Mayotte" },
    { value: "MEX", desc: "Mexico" },
    { value: "FSM", desc: "Micronesia" },
    { value: "MDA", desc: "Moldova" },
    { value: "MCO", desc: "Monaco" },
    { value: "MNG", desc: "Mongolia" },
    { value: "MSR", desc: "Montserrat" },
    { value: "MAR", desc: "Morocco" },
    { value: "MOZ", desc: "Mozambique" },
    { value: "MMR", desc: "Myanmar" },
    { value: "NAM", desc: "Namibia" },
    { value: "NRU", desc: "Nauru" },
    { value: "NPL", desc: "Nepal" },
    { value: "NLD", desc: "Netherlands" },
    { value: "ANT", desc: "Netherlands Antilles" },
    { value: "NCL", desc: "New Caledonia" },
    { value: "NZL", desc: "New Zealand (Aotearoa)" },
    { value: "NIC", desc: "Nicaragua" },
    { value: "NER", desc: "Niger" },
    { value: "NGA", desc: "Nigeria" },
    { value: "NIU", desc: "Niue" },
    { value: "NFK", desc: "Norfolk Island" },
    { value: "MNP", desc: "Northern Mariana Islands" },
    { value: "NOR", desc: "Norway" },
    { value: "OMN", desc: "Oman" },
    { value: "PAK", desc: "Pakistan" },
    { value: "PLW", desc: "Palau" },
    { value: "PAN", desc: "Panama" },
    { value: "PNG", desc: "Papua New Guinea" },
    { value: "PRY", desc: "Paraguay" },
    { value: "PER", desc: "Peru" },
    { value: "PCN", desc: "Pitcairn" },
    { value: "POL", desc: "Poland" },
    { value: "PRT", desc: "Portugal" },
    { value: "PRI", desc: "Puerto Rico" },
    { value: "QAT", desc: "Qatar" },
    { value: "REU", desc: "Reunion" },
    { value: "ROM", desc: "Romania" },
    { value: "RUS", desc: "Russian Federation" },
    { value: "RWA", desc: "Rwanda" },
    { value: "SGS", desc: "S. Georgia and S. Sandwich Isls." },
    { value: "KNA", desc: "Saint Kitts and Nevis" },
    { value: "LCA", desc: "Saint Lucia" },
    { value: "VCT", desc: "Saint Vincent and The Grenadines" },
    { value: "WSM", desc: "Samoa" },
    { value: "SMR", desc: "San Marino" },
    { value: "STP", desc: "Sao Tome and Principe" },
    { value: "SAU", desc: "Saudi Arabia" },
    { value: "SEN", desc: "Senegal" },
    { value: "SYC", desc: "Seychelles" },
    { value: "SLE", desc: "Sierra Leone" },
    { value: "SGP", desc: "Singapore" },
    { value: "SXM", desc: "Sint Maarten" },
    { value: "SVK", desc: "Slovak Republic" },
    { value: "SVN", desc: "Slovenia" },
    { value: "SOM", desc: "Somalia" },
    { value: "ZAF", desc: "South Africa" },
    { value: "SSD", desc: "South Sudan" },
    { value: "ESP", desc: "Spain" },
    { value: "LKA", desc: "Sri Lanka" },
    { value: "SHN", desc: "St. Helena" },
    { value: "SPM", desc: "St. Pierre and Miquelon" },
    { value: "SDN", desc: "Sudan" },
    { value: "SUR", desc: "Suriname" },
    { value: "SJM", desc: "Svalbard and Jan Mayen Islands" },
    { value: "SWZ", desc: "Swaziland" },
    { value: "SWE", desc: "Sweden" },
    { value: "CHE", desc: "Switzerland" },
    { value: "SYR", desc: "Syria" },
    { value: "TWN", desc: "Taiwan" },
    { value: "TJK", desc: "Tajikistan" },
    { value: "TZA", desc: "Tanzania" },
    { value: "THA", desc: "Thailand" },
    { value: "TGO", desc: "Togo" },
    { value: "TKL", desc: "Tokelau" },
    { value: "TON", desc: "Tonga" },
    { value: "TTO", desc: "Trinidad and Tobago" },
    { value: "TUN", desc: "Tunisia" },
    { value: "TUR", desc: "Turkey" },
    { value: "TKM", desc: "Turkmenistan" },
    { value: "TCA", desc: "Turks and Caicos Islands" },
    { value: "TUV", desc: "Tuvalu" },
    { value: "UGA", desc: "Uganda" },
    { value: "UKR", desc: "Ukraine" },
    { value: "ARE", desc: "United Arab Emirates" },
    { value: "USA", desc: "United States" },
    { value: "URY", desc: "Uruguay" },
    { value: "UMI", desc: "U.S. Minor Outlying Islands" },
    { value: "UZB", desc: "Uzbekistan" },
    { value: "VUT", desc: "Vanuatu" },
    { value: "VAT", desc: "Vatican City State (Holy See)" },
    { value: "VEN", desc: "Venezuela" },
    { value: "VNM", desc: "Viet Nam" },
    { value: "VGB", desc: "Virgin Islands (British)" },
    { value: "VIR", desc: "Virgin Islands (U.S.)" },
    { value: "WLF", desc: "Wallis and Futuna Islands" },
    { value: "ESH", desc: "Western Sahara" },
    { value: "YEM", desc: "Yemen" },
    { value: "YUG", desc: "Yugoslavia" },
    { value: "ZMB", desc: "Zambia" },
    { value: "ZWE", desc: "Zimbabwe" }
];

var salutations = [
    { value: "MR", desc: "Mr." },
    { value: "MS", desc: "Ms." },
    { value: "MRS", desc: "Mrs." }
]

var civil_status = [
    { value: "S", desc: "Single" },
    { value: "M", desc: "Married" }
]

var ranks = [
    { value: "0", desc: "Employed-Private" },
    { value: "1", desc: "Employed- Government" },
    { value: "2", desc: "OFW" },
    { value: "3", desc: "Bus. Owner-Sole Prop." },
    { value: "4", desc: "Bus. Owner-Partner/Assoc." },
    { value: "5", desc: "Part Owner of Corp." },
    { value: "6", desc: "Unemployed" }
]

module.exports = {
    nationality,
    salutations,
    civil_status,
    ranks
}