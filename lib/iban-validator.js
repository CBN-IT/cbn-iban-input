(function(Validator) {
	
	CbnForm.IbanInput = {};
	
	/**
	 * Validates the given IBAN string.
	 * 
	 * @param {String}    iban The IBAN code to validate.
	 * @returns {Boolean} Whether the specified IBAN is valid or not.
	 */
	CbnForm.IbanInput.validateIban = function (iban) {
		/* remove all whitespace */
		var ibanNr = iban.replace(/[\s]+/g, "");
		
		/* move first 4 chars to the end of the string */
		ibanNr = (ibanNr.substr(4) + ibanNr.substr(0, 4));
		/* transform letters to their corresponding numeric value */
		/* (a is 10, b is 11, z is 35) */
		ibanNr = ibanNr.replace(/[a-z]/gi, function (letter) {
			return "" + (letter.toUpperCase().charCodeAt(0) - 55);
		});
		
		/* calculate modulo 97 like stated on wiki */
		/* https://en.wikipedia.org/wiki/International_Bank_Account_Number#Generating_IBAN_check_digits */
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
		return ibanNr === "01";
	};
	
	/**
	 * Validates if the given bank account number is correct (using a specific algorithm).
	 */
	Validator.register({
		name: 'iban',
		types: ['text'],
		message: 'Invalid IBAN!',
		validate: function(value, settings/*, input, stop */) {
			settings = Validator.normalizeSettings (settings);
			if (!settings.validate)
				return true;
			
			return CbnForm.IbanInput.validateIban(value);
		}
	});
	
	/**
	 * Parses the specified IBAN string, returning an object with the details contained within.
	 * 
	 * The IBAN value must be valid in order for this to work!
	 * 
	 * @param {String}   iban The IBAN to parse / extract details from.
	 * @returns {Object} The extracted details.
	 */
	CbnForm.IbanInput.parseIban = function (iban) {
		var returnObj = {};
		var ibanValue = iban.replace(/ /gi, "");
		if (ibanValue.length < 2) {
			return null;
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
					var bic = getByLetter(ibanValue, "b", validator.pattern);
					returnObj["bic"] = bic;
					returnObj["bank"] = bankCodes[countryCode][bic];
					returnObj["account"] = getByLetter(ibanValue, "c", validator.pattern);
					returnObj["branch"] = getByLetter(ibanValue, "sg", validator.pattern);
					returnObj["nationalCheckDigit"] = getByLetter(ibanValue, "x", validator.pattern);
				}
			}
		}
		return returnObj;
	};
	
	function getByLetter(iban, letter, pattern) {
		pattern = pattern.replace(/[ ]/g, "").substr(4);
		var bicHelper = pattern.match(new RegExp("[" + letter + "]+"));
		if (bicHelper === null) {
			return undefined;
		}
		var bicStart = bicHelper["index"];
		var bicLength = bicHelper[0].length;
		return iban.substr(bicStart + 4, bicLength).toUpperCase();
	}
	
	function validateBban(iban, bban) {
		var format = {
			a: "[A-Z]",
			n: "[0-9]",
			c: "[a-zA-Z0-9]"
		};
		var bbanVal = bban.replace(/[, ]+/g, "").replace(/([0-9]+)([anc])/g, function (mach, number, c) {
			return format[c] + "{" + number + "}";
		});
		var reg = new RegExp("[A-Z]{2}[0-9]{2}" + bbanVal);
		
		return iban.match(reg) !== null;
	}
	
	//noinspection SpellCheckingInspection
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
	
	//noinspection SpellCheckingInspection
	var validators = [
		{
			country: "AL",
			pattern: "ALkk bbbs sssx cccc cccc cccc cccc",
			length: 28,
			bban: "8n, 16c"
		},
		{
			country: "AD",
			pattern: "ADkk bbbb ssss cccc cccc cccc",
			length: 24,
			bban: "8n,16c"
		},
		{
			country: "AT",
			pattern: "ATkk bbbb bccc cccc cccc",
			length: 20,
			bban: "16n"
		},
		{
			country: "AZ",
			pattern: "AZkk bbbb cccc cccc cccc cccc cccc",
			length: 28,
			bban: "4c,20n"
		},
		{
			country: "BH",
			pattern: "BHkk bbbb cccc cccc cccc cc",
			length: 22,
			bban: "4a,14c"
		},
		{
			country: "BE",
			pattern: "BEkk bbbc cccc ccxx",
			length: 16,
			bban: "12n"
		},
		{
			country: "Bosnia and Herzegovina",
			pattern: "BAkk bbbs sscc cccc ccxx",
			length: 20,
			bban: "16n"
		},
		{
			country: "Brazil",
			pattern: "BRkk bbbb bbbb ssss sccc cccc ccct n",
			length: 22,
			bban: "23n, 1a, 1c"
		},
		{
			country: "BG",
			pattern: "BGkk bbbb ssss ddcc cccc cc",
			length: 22,
			bban: "4a,6n,8c"
		},
		{
			country: "Costa Rica",
			pattern: "CRkk bbbc cccc cccc cccc c",
			length: 21,
			bban: "17n"
		},
		{
			country: "Croatia",
			pattern: "HRkk bbbb bbbc cccc cccc c",
			length: 21,
			bban: "17n"
		},
		{
			country: "Cyprus",
			pattern: "CYkk bbbs ssss cccc cccc cccc cccc",
			length: 28,
			bban: "8n,16c"
		},
		{
			country: "Czech Republic",
			pattern: "CZkk bbbb ssss sscc cccc cccc",
			length: 24,
			bban: "20n"
		},
		{
			country: "Denmark",
			pattern: "DKkk bbbb cccc cccc cc",
			length: 18,
			bban: "14n"
		},
		{
			country: "Dominican Republic",
			pattern: "DOkk bbbb cccc cccc cccc cccc cccc",
			length: 28,
			bban: "4a,20n"
		},
		{
			country: "East Timor",
			pattern: "TLkk bbbc cccc cccc cccc cxx",
			length: 23,
			bban: "19n"
		},
		{
			country: "Estonia",
			pattern: "EEkk bbss cccc cccc cccx",
			length: 20,
			bban: "16n"
		},
		{
			country: "Faroe Islands",
			pattern: "FOkk bbbb cccc cccc cx",
			length: 18,
			bban: "14n"
		},
		{
			country: "Finland",
			pattern: "FIkk bbbb bbcc cccc cx",
			length: 18,
			bban: "14n"
		},
		{
			country: "France",
			pattern: "FRkk bbbb bggg ggcc cccc cccc cxx",
			length: 27,
			bban: "10n,11c,2n"
		},
		{
			country: "Georgia",
			pattern: "GEkk bbcc cccc cccc cccc cc",
			length: 22,
			bban: "2c,16n"
		},
		{
			country: "Germany",
			pattern: "DEkk bbbb bbbb cccc cccc cc",
			length: 22,
			bban: "18n"
		},
		{
			country: "Gibraltar",
			pattern: "GIkk bbbb cccc cccc cccc ccc",
			length: 23,
			bban: "4a,15c"
		},
		{
			country: "Greece",
			pattern: "GRkk bbbs sssc cccc cccc cccc ccc",
			length: 27,
			bban: "7n,16c"
		},
		{
			country: "Greenland",
			pattern: "GLkk bbbb cccc cccc cc",
			length: 18,
			bban: "14n"
		},
		{
			country: "Guatemala",
			pattern: "GTkk bbbb mmtt cccc cccc cccc cccc",
			length: 28,
			bban: "4c,20c"
		},
		{
			country: "Hungary",
			pattern: "HUkk bbbs sssk cccc cccc cccc cccx",
			length: 28,
			bban: "24n"
		},
		{
			country: "Iceland",
			pattern: "ISkk bbbb sscc cccc iiii iiii ii",
			length: 26,
			bban: "22n"
		},
		{
			country: "Ireland",
			pattern: "IEkk aaaa bbbb bbcc cccc cc",
			length: 22,
			bban: "4c,14n"
		},
		{
			country: "Israel",
			pattern: "ILkk bbbn nncc cccc cccc ccc",
			length: 23,
			bban: "19n"
		},
		{
			country: "Italy",
			pattern: "ITkk xaaa aabb bbbc cccc cccc ccc",
			length: 27,
			bban: "1a,10n,12c"
		},

		{
			country: "MD",
			pattern: "MDkk bbcc cccc cccc cccc cccc",
			length: 24,
			bban: "2c,18c"
		},
		{
			country: "ES",
			pattern: "ESkk bbbb gggg xxcc cccc cccc",
			length: 24,
			bban: "20n"
		},
		{
			country: "RO",
			pattern: "ROkk bbbb cccc cccc cccc cccc",
			length: 24,
			bban: "4a,16c"
		}
		
		
	];
	
})(CbnForm.Validator);
