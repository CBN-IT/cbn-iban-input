function validateIbanCheckDigit(iban) {
	/*move first 4 chars to the end of the string*/
	
	var ibanNr = iban.replace(/[\s]+/g,"");
	ibanNr = (ibanNr.substr(4) + ibanNr.substr(0, 4));
	/*transform letters to their corresponding numeric value */
	/*(a is 10, b is 11, z is 35)*/
	ibanNr = ibanNr.replace(/[a-z]/gi, function (letter) {
		return "" + (letter.toUpperCase().charCodeAt(0) - 55);

	});
	/*calculate modulo 97 like stated on wiki*/
	/*https://en.wikipedia.org/wiki/International_Bank_Account_Number#Generating_IBAN_check_digits*/
	while (ibanNr.length > 2) {
		var N, remainder;
		if (ibanNr.length >= 9) {
			N = ibanNr.substr(0, 9);
			remainder = ibanNr.substr(9);
		} else {
			N = ibanNr;
			remainder = "";
		}
		N = parseInt(N, 10);
		N = N % 97;
		if (N >= 10) {
			ibanNr = N + remainder;
		} else {
			ibanNr = "0" + N + remainder;
		}
	}
	console.log(iban, ibanNr === "01");
	return ibanNr === "01";
}
function getIbanDetailes(iban){
	var returnObj = {
	};
	var ibanValue = iban.replace(/ /gi, "");
	if (ibanValue.length < 2) {
		return;
	}
	var countryCode = ibanValue.substr(0, 2);
	countryCode = countryCode.toUpperCase();
	returnObj["country"] = countryCode;
	var validator = null;
	for (var i = 0; i < validators.length; i++) {
		var v = validators[i];
		if (v.country === countryCode) {
			validator = v;
			break;
		}
	}
	if (validator != null) {
		if (ibanValue.length == validator.length) {
			if (validateBban(ibanValue, validator.bban)) {
				var bic = _getByLetter(ibanValue, "b", validator.pattern);
				returnObj["bic"] = bic;
				returnObj["bank"] = bankCodes[countryCode][bic];
				returnObj["account"] =  _getByLetter(ibanValue, "c", validator.pattern);
				returnObj["branch"] =  _getByLetter(ibanValue, "sg", validator.pattern);
				returnObj["nationalCheckDigit"] =  _getByLetter(ibanValue, "x", validator.pattern);
			}
		}
	}
	return returnObj;
}
function _getByLetter(iban, letter, pattern){
	pattern = pattern.replace(/[ ]/g, "").substr(4);
	var bicHelper = pattern.match(new RegExp("["+letter+"]+"));
	if(bicHelper===null){
		return undefined;
	}
	var bicStart = bicHelper["index"];
	var bicLength = bicHelper[0].length;
	return iban.substr(bicStart + 4, bicLength).toUpperCase();
}
function validateBban(iban, bban){
	var format = {
		a:"[A-Z]",
		n:"[0-9]",
		c:"[a-zA-Z0-9]"
	};
	var bbanVal = bban.replace(/[, ]+/g,"").replace(/([0-9]+)([anc])/g, function(mach, number, c){
		return format[c]+"{"+number+"}";
	});
	var reg = new RegExp("[A-Z]{2}[0-9]{2}"+bbanVal);

	return iban.match(reg) !== null;
}
var bankCodes = {
	"RO": {
		"ABNA": "RBS BANK ROMANIA",
		"ARBL": "ANGLO ROMANIAN BANK",
		"BCUN": "NOVA BANK SA",
		"BCYP": "BANK OF CYPRUS ROMANIA",
		"BITR": "BANCA ITALO ROMENA",
		"BLOM": "BLOM BANK FRANCE S.A. PARIS SUC ROMANIA",
		"BPOS": "BANC POST SA",
		"BRDE": "BANCA ROMANA PENTRU DEZVOLTARE",
		"BREL": "LIBRA INTERNET BANK",
		"BRMA": "BANCA ROMANEASCA",
		"BSEA": "EMPORIKI BANK ROMANIA",
		"BTRL": "BANCA TRANSILVANIA",
		"BUCU": "ALPHA BANK",
		"CAIX": "CAJA DE AHORROS Y PENSIONES BARCELONA",
		"CARP": "BANCA COMERCIALA CARPATICA",
		"CECE": "CEC BANK",
		"CITI": "CITIBANK ROMANIA",
		"CRCO": "BANCA CENTRALA COOPERATISTA CREDITCOOP",
		"CRDZ": "MKB ROMEXTERRA SA",
		"DABA": "Danske Bank Copenhagen",
		"DAFB": "BANK LEUMI ROMANIA",
		"DARO": "BANCA C.R. FIRENZE ROMANIA",
		"DPFA": "DEPFA BANK PLC DUBLIN SUC BUCURESTI",
		"EGNA": "MARFIN BANK ROMANIA",
		"ETHN": "NATIONAL BANK OF GREECE",
		"EXIM": "EXIMBANK",
		"FNNB": "CREDIT EUROPE BANK ROMANIA",
		"FRBU": "FRANKFURT BUCHAREST BANK",
		"FTSB": "FORTIS BANK SA NV BRUXELLES SUC BUCUREST",
		"HVBL": "HVB BANCA PENTRU LOCUINTE",
		"INGB": "ING BANK ROMANIA",
		"MILB": "BANCA MILLENIUM",
		"MIND": "ATE BANK ROMANIA",
		"MIRO": "PROCREDIT BANK",
		"NBOR": "BANCA NATIONALA A ROMANIEI",
		"OTPV": "OTP BANK ROMANIA",
		"PIRB": "PIRAEUS BANK ROMANIA",
		"PORL": "PORSCHE BANK",
		"RNCB": "BANCA COMERCIALA ROMANA",
		"ROIN": "ROMANIAN INTERNATIONAL BANK",
		"RZBL": "RAIFFEISEN BANCA PT LOCUINTE",
		"RZBR": "RAIFFEISEN BANK ROMANIA",
		"TRFD": "TRANSFOND SA",
		"UGBI": "GARANTIBANK INTERNATIONAL NV",
		"VBBU": "VOLKSBANK ROMANIA",
		"WBAN": "BANCA COMERCIALA INTESA SANPAOLO ROMANIA",
		"BCRL": "BCR BANCA PENTRU LOCUINTE",
		"TREZ": "TREZORERIA STATULUI",
		"BACX": "UNICREDIT TIRIAC BANK",

		"CBIT": "BANCA COMERCIALA ION TIRIAC",
		"BNRB": "BANCA COMERCIALA ROBANK",
		"BROM": "BANCA DI ROMA",
		"MIRB": "MISR",
		"UNCR": "UNICREDIT ROMANIA",
		"BFRO": "BANQUE FRANCO-ROUMAINE CENTRALA",
		"TBIB": "TBI BANK EAD SOFIA BUCHAREST BRANCH",
		"BFER": "Banca Comerciala Feroviara"
	}
};

var validators = [
	{
		country: "AL",
		pattern: "ALkk bbbs sssx cccc cccc cccc cccc",
		length: 28,
		bban:"8n, 16c"
	},
	{
		country: "AD",
		pattern: "ADkk bbbb ssss cccc cccc cccc",
		length: 24,
		bban:"8n,16c"
	},
	{
		country: "AT",
		pattern: "ATkk bbbb bccc cccc cccc",
		length: 20,
		bban:"16n"
	},
	{
		country: "AZ",
		pattern: "AZkk bbbb cccc cccc cccc cccc cccc",
		length: 28,
		bban:"4c,20n"
	},
	{
		country: "BH",
		pattern: "BHkk bbbb cccc cccc cccc cc",
		length: 22,
		bban:"4a,14c"
	},
	{
		country: "BE",
		pattern: "BEkk bbbc cccc ccxx",
		length: 16,
		bban:"12n"
	},
	{
		country: "RO",
		pattern: "ROkk bbbb cccc cccc cccc cccc",
		length: 24,
		bban:"4a,16c"
	}
];
