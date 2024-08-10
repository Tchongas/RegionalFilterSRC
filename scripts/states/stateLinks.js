var stateLinks = {
	"Acre": "ac",
	"Alagoas": "al",
	"Amapa": "ap",
	"Amazonas": "am",
	"Bahia": "ba",
	"Ceara": "ce",
	"Distrito Federal": "df",
	"Espirito Santo": "es",
	"Goias": "go",
	"Maranhao": "ma",
	"Mato Grosso": "mt",
	"Mato Grosso do Sul": "ms",
	"Minas Gerais": "mg",
	"Para": "pa",
	"Paraiba": "pb",
	"Parana": "pr",
	"Pernambuco": "pe",
	"Piaui": "pi",
	"Rio de Janeiro": "rj",
	"Rio Grande do Norte": "rn",
	"Rio Grande do Sul": "rs",
	"Rondonia": "ro",
	"Roraima": "rr",
	"Santa Catarina": "sc",
	"São Paulo": "sp",
	"Sergipe": "se",
	"Tocantins": "to",
    "null": "null"
};


function getStateCode(stateName) {
	return stateLinks[stateName];
}

