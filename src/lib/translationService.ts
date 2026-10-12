import { transliterateText } from './transliterate';

export type SupportedLanguage = 'en' | 'kn' | 'hi';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', flag: '🇮🇳' },
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
];

export const DICTIONARY_KN: Record<string, string> = {
  // Common Shop Names & Types
  'quick mart': 'ಕ್ವಿಕ್ ಮಾರ್ಟ್',
  'quick': 'ಕ್ವಿಕ್',
  'mart': 'ಮಾರ್ಟ್',
  'super mart': 'ಸೂಪರ್ ಮಾರ್ಟ್',
  'super market': 'ಸೂಪರ್ ಮಾರ್ಕೆಟ್',
  'super': 'ಸೂಪರ್',
  'market': 'ಮಾರುಕಟ್ಟೆ',
  'main market': 'ಮುಖ್ಯ ಮಾರುಕಟ್ಟೆ',
  'store': 'ಸ್ಟೋರ್',
  'stores': 'ಸ್ಟೋರ್ಸ್',
  'shop': 'ಅಂಗಡಿ',
  'shops': 'ಅಂಗಡಿಗಳು',
  'provision': 'ಪ್ರಾವಿಷನ್',
  'general store': 'ಜನರಲ್ ಸ್ಟೋರ್',
  'general': 'ಜನರಲ್',
  'kirana': 'ಕಿರಾಣಿ',
  'bakery': 'ಬೇಕರಿ',
  'sweets': 'ಸ್ವೀಟ್ಸ್',
  'sweet': 'ಸ್ವೀಟ್',
  'hotel': 'ಹೋಟೆಲ್',
  'medical': 'ಮೆಡಿಕಲ್',
  'pharmacy': 'ಫಾರ್ಮಸಿ',
  'cloth': 'ಬಟ್ಟೆ',
  'textiles': 'ಟೆಕ್ಸ್‌ಟೈಲ್ಸ್',
  'garments': 'ಗಾರ್ಮೆಂಟ್ಸ್',
  'footwear': 'ಫುಟ್‌ವೇರ್',
  'jewellers': 'ಜ್ಯುವೆಲ್ಲರ್ಸ್',
  'jewellery': 'ಜ್ಯುವೆಲ್ಲರಿ',
  'gold': 'ಚಿನ್ನ',
  'silver': 'ಬೆಳ್ಳಿ',
  'electronics': 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್',
  'electricals': 'ಎಲೆಕ್ಟ್ರಿಕಲ್ಸ್',
  'hardware': 'ಹಾರ್ಡ್‌ವೇರ್',
  'mobile': 'ಮೊಬೈಲ್',
  'mobiles': 'ಮೊಬೈಲ್ಸ್',
  'enterprises': 'ಎಂಟರ್‌ಪ್ರೈಸಸ್',
  'traders': 'ಟ್ರೇಡರ್ಸ್',
  'agencies': 'ಏಜೆನ್ಸೀಸ್',
  'centre': 'ಸೆಂಟರ್',
  'center': 'ಸೆಂಟರ್',
  'hub': 'ಹಬ್',
  'point': 'ಪಾಯಿಂಟ್',
  'world': 'ವರ್ಲ್ಡ್',
  'bazaar': 'ಬಜಾರ್',
  'bazar': 'ಬಜಾರ್',
  'stationery': 'ಸ್ಟೇಷನರಿ',
  'fancy': 'ಫ್ಯಾನ್ಸಿ',
  'saloon': 'ಸಲೂನ್',
  'beauty': 'ಬ್ಯೂಟಿ',
  'parlour': 'ಪಾರ್ಲರ್',
  'auto': 'ಆಟೋ',
  'motors': 'ಮೋಟಾರ್ಸ್',
  'garage': 'ಗ್ಯಾರೇಜ್',
  'service': 'ಸರ್ವೀಸ್',
  'services': 'ಸರ್ವೀಸಸ್',
  'clinic': 'ಕ್ಲಿನಿಕ್',
  'hospital': 'ಆಸ್ಪತ್ರೆ',
  'lab': 'ಲ್ಯಾಬ್',
  'diagnostics': 'ಡಯಾಗ್ನೋಸ್ಟಿಕ್ಸ್',
  'studio': 'ಸ್ಟುಡಿಯೋ',
  'press': 'ಪ್ರೆಸ್',
  'printers': 'ಪ್ರಿಂಟರ್ಸ್',
  'xerox': 'ಜೆರಾಕ್ಸ್',
  'books': 'ಪುಸ್ತಕಗಳು',
  'depot': 'ಡಿಪೋ',
  'stall': 'ಸ್ಟಾಲ್',
  'tea': 'ಟೀ',
  'coffee': 'ಕಾಫಿ',
  'cafe': 'ಕೆಫೆ',

  // Names commonly in Indian shop names
  'sri': 'ಶ್ರೀ',
  'shri': 'ಶ್ರೀ',
  'shree': 'ಶ್ರೀ',
  'om': 'ಓಂ',
  'sai': 'ಸಾಯಿ',
  'lakshmi': 'ಲಕ್ಷ್ಮಿ',
  'laxmi': 'ಲಕ್ಷ್ಮಿ',
  'ganesh': 'ಗಣೇಶ್',
  'ganesha': 'ಗಣೇಶ',
  'shiva': 'ಶಿವ',
  'krishna': 'ಕೃಷ್ಣ',
  'ram': 'ರಾಮ್',
  'rama': 'ರಾಮ',
  'hanuman': 'ಹನುಮಾನ್',
  'balaji': 'ಬಾಲಾಜಿ',
  'venkateshwara': 'ವೆಂಕಟೇಶ್ವರ',
  'manjunatha': 'ಮಂಜುನಾಥ',
  'basaveshwara': 'ಬಸವೇಶ್ವರ',
  'chamundeshwari': 'ಚಾಮುಂಡೇಶ್ವರಿ',
  'anand': 'ಆನಂದ್',
  'kumar': 'ಕುಮಾರ್',
  'raju': 'ರಾಜು',
  'ravi': 'ರವಿ',
  'vijay': 'ವಿಜಯ್',
  'praveen': 'ಪ್ರವೀಣ್',
  'suresh': 'ಸುರೇಶ್',
  'ramesh': 'ರಮೇಶ್',
  'mahesh': 'ಮಹೇಶ್',
  'santosh': 'ಸಂತೋಷ್',
  'prakash': 'ಪ್ರಕಾಶ್',
  'patil': 'ಪಾಟಿಲ್',
  'gowda': 'ಗೌಡ',
  'shetty': 'ಶೆಟ್ಟಿ',
  'reddy': 'ರೆಡ್ಡಿ',
  'rao': 'ರಾವ್',
  'nayak': 'ನಾಯಕ್',

  // Locations & Districts
  'konnur': 'ಕೊನ್ನೂರು',
  'kunnor': 'ಕುನ್ನೋರ್',
  'kunnur': 'ಕುನ್ನೂರ್',
  'bangalore': 'ಬೆಂಗಳೂರು',
  'bengaluru': 'ಬೆಂಗಳೂರು',
  'mysore': 'ಮೈಸೂರು',
  'mysuru': 'ಮೈಸೂರು',
  'hubli': 'ಹುಬ್ಬಳ್ಳಿ',
  'hubballi': 'ಹುಬ್ಬಳ್ಳಿ',
  'dharwad': 'ಧಾರವಾಡ',
  'belgaum': 'ಬೆಳಗಾವಿ',
  'belagavi': 'ಬೆಳಗಾವಿ',
  'mangalore': 'ಮಂಗಳೂರು',
  'mangaluru': 'ಮಂಗಳೂರು',
  'gulbarga': 'ಕಲಬುರಗಿ',
  'kalaburagi': 'ಕಲಬುರಗಿ',
  'bellary': 'ಬಳ್ಳಾರಿ',
  'ballari': 'ಬಳ್ಳಾರಿ',
  'bijapur': 'ವಿಜಯಪುರ',
  'vijayapura': 'ವಿಜಯಪುರ',
  'shimoga': 'ಶಿವಮೊಗ್ಗ',
  'shivamogga': 'ಶಿವಮೊಗ್ಗ',
  'tumkur': 'ತುಮಕೂರು',
  'tumakuru': 'ತುಮಕೂರು',
  'raichur': 'ರಾಯಚೂರು',
  'bidar': 'ಬೀದರ್',
  'hospet': 'ಹೊಸಪೇಟೆ',
  'hosapete': 'ಹೊಸಪೇಟೆ',
  'hassan': 'ಹಾಸನ',
  'gadag': 'ಗದಗ',
  'udupi': 'ಉಡುಪಿ',
  'davangere': 'ದಾವಣಗೆರೆ',
  'chitradurga': 'ಚಿತ್ರದುರ್ಗ',
  'kolar': 'ಕೋಲಾರ',
  'mandya': 'ಮಂಡ್ಯ',
  'chikkamagaluru': 'ಚಿಕ್ಕಮಗಳೂರು',
  'chikmagalur': 'ಚಿಕ್ಕಮಗಳೂರು',
  'bagalkot': 'ಬಾಗಲಕೋಟೆ',
  'haveri': 'ಹಾವೇರಿ',
  'karwar': 'ಕಾರವಾರ',
  'koppal': 'ಕೊಪ್ಪಳ',
  'yadgir': 'ಯಾದಗಿರಿ',
  'gokak': 'ಗೋಕಾಕ್',
  'sirsi': 'ಶಿರಸಿ',
  'nipani': 'ನಿಪ್ಪಾಣಿ',
  'dandeli': 'ದಾಂಡೇಲಿ',
  'channapatna': 'ಚನ್ನಪಟ್ಟಣ',
  'ramanagara': 'ರಾಮನಗರ',

  // Areas & Streets
  'gandhi road': 'ಗಾಂಧಿ ರಸ್ತೆ',
  'station square': 'ನಿಲ್ದಾಣ ವೃತ್ತ',
  'commercial zone': 'ವಾಣಿಜ್ಯ ವಲಯ',
  'shopping complex': 'ಶಾಪಿಂಗ್ ಕಾಂಪ್ಲೆಕ್ಸ್',
  'station road': 'ಸ್ಟೇಷನ್ ರಸ್ತೆ',
  'bus stand': 'ಬಸ್ ನಿಲ್ದಾಣ',
  'railway station': 'ರೈಲ್ವೆ ನಿಲ್ದಾಣ',
  'road': 'ರಸ್ತೆ',
  'street': 'ಬೀದಿ',
  'circle': 'ವೃತ್ತ',
  'cross': 'ಕ್ರಾಸ್',
  'main': 'ಮುಖ್ಯ',
  'layout': 'ಬಡಾವಣೆ',
  'nagar': 'ನಗರ',
  'colony': 'ಕಾಲೋನಿ',
  'central': 'ಕೇಂದ್ರ',
  'north': 'ಉತ್ತರ',
  'south': 'ದಕ್ಷಿಣ',
  'east': 'ಪೂರ್ವ',
  'west': 'ಪಶ್ಚಿಮ',
  'city': 'ನಗರ',
  'town': 'ಪಟ್ಟಣ',
  'village': 'ಹಳ್ಳಿ'
};

export const DICTIONARY_HI: Record<string, string> = {
  // Common Shop Names & Types
  'quick mart': 'क्विक मार्ट',
  'quick': 'क्विक',
  'mart': 'मार्ट',
  'super mart': 'सुपर मार्ट',
  'super market': 'सुपर मार्केट',
  'super': 'सुपर',
  'market': 'बाज़ार',
  'main market': 'मुख्य बाज़ार',
  'store': 'स्टोर',
  'stores': 'स्टोर्स',
  'shop': 'दुकान',
  'shops': 'दुकानें',
  'provision': 'प्रोविज़न',
  'general store': 'जनरल स्टोर',
  'general': 'जनरल',
  'kirana': 'किराना',
  'bakery': 'बेकरी',
  'sweets': 'मिठाई',
  'sweet': 'मिठाई',
  'hotel': 'होटल',
  'medical': 'मेडिकल',
  'pharmacy': 'फार्मेसी',
  'cloth': 'कपड़ा',
  'textiles': 'टेक्सटाइल्स',
  'garments': 'गारमेंट्स',
  'footwear': 'फुटवियर',
  'jewellers': 'ज्वेलर्स',
  'jewellery': 'ज्वेलरी',
  'gold': 'सोना',
  'silver': 'चांदी',
  'electronics': 'इलेक्ट्रॉनिक्स',
  'electricals': 'इलेक्ट्रिकल्स',
  'hardware': 'हार्डवेयर',
  'mobile': 'मोबाइल',
  'mobiles': 'मोबाइल',
  'enterprises': 'एंटरप्राइजेज',
  'traders': 'ट्रेडर्स',
  'agencies': 'एजेंसियां',
  'centre': 'सेंटर',
  'center': 'सेंटर',
  'hub': 'हब',
  'point': 'पॉइंट',
  'world': 'वर्ल्ड',
  'bazaar': 'बाज़ार',
  'bazar': 'बाज़ार',
  'stationery': 'स्टेशनरी',
  'fancy': 'फैंसी',
  'saloon': 'सैलून',
  'beauty': 'ब्यूटी',
  'parlour': 'पार्लर',
  'auto': 'ऑटो',
  'motors': 'मोटर्स',
  'garage': 'गैराज',
  'service': 'सर्विस',
  'services': 'सर्विसेज',
  'clinic': 'क्लिनिक',
  'hospital': 'अस्पताल',
  'lab': 'लैब',
  'diagnostics': 'डायग्नोस्टिक्स',
  'studio': 'स्टूडियो',
  'press': 'प्रेस',
  'printers': 'प्रिंटर्स',
  'xerox': 'ज़ेरॉक्स',
  'books': 'किताबें',
  'depot': 'डिपो',
  'stall': 'स्टॉल',
  'tea': 'चाय',
  'coffee': 'कॉफी',
  'cafe': 'कैफे',

  // Names commonly in Indian shop names
  'sri': 'श्री',
  'shri': 'श्री',
  'shree': 'श्री',
  'om': 'ओम',
  'sai': 'साईं',
  'lakshmi': 'लक्ष्मी',
  'laxmi': 'लक्ष्मी',
  'ganesh': 'गणेश',
  'ganesha': 'गणेश',
  'shiva': 'शिव',
  'krishna': 'कृष्णा',
  'ram': 'राम',
  'rama': 'राम',
  'hanuman': 'हनुमान',
  'balaji': 'बालाजी',
  'venkateshwara': 'वेंकटेश्वर',
  'manjunatha': 'मंजुनाथ',
  'basaveshwara': 'बसवेश्वर',
  'anand': 'आनंद',
  'kumar': 'कुमार',
  'raju': 'राजू',
  'ravi': 'रवि',
  'vijay': 'विजय',
  'praveen': 'प्रवीण',
  'suresh': 'सुरेश',
  'ramesh': 'रमेश',
  'mahesh': 'महेश',
  'santosh': 'संतोष',
  'prakash': 'प्रकाश',
  'patil': 'पाटिल',
  'gowda': 'गौड़ा',
  'shetty': 'शेट्टी',
  'reddy': 'रेड्डी',
  'rao': 'राव',
  'nayak': 'नायक',

  // Locations
  'konnur': 'कोन्नूर',
  'kunnor': 'कुन्नोर',
  'kunnur': 'कुन्नूर',
  'bangalore': 'बैंगलोर',
  'bengaluru': 'बेंगलुरु',
  'mysore': 'मैसूर',
  'mysuru': 'मैसूरु',
  'hubli': 'हुबली',
  'hubballi': 'हुब्बल्ली',
  'dharwad': 'धारवाड़',
  'belgaum': 'बेलगाम',
  'belagavi': 'बेलगावी',
  'mangalore': 'मंगलौर',
  'mangaluru': 'मंगलुरु',
  'gulbarga': 'गुलबर्गा',
  'bellary': 'बेल्लारी',
  'bijapur': 'बीजापुर',
  'shimoga': 'शिमोगा',
  'tumkur': 'तुमकुर',
  'raichur': 'रायचूर',
  'bidar': 'बीदर',
  'hospet': 'होसपेट',
  'hassan': 'हासन',
  'gadag': 'गदग',
  'udupi': 'उडुपी',
  'davangere': 'दावणगेरे',
  'chitradurga': 'चित्रदुर्ग',
  'kolar': 'कोलार',
  'mandya': 'मांड्या',
  'chikkamagaluru': 'चिकमगलूर',
  'bagalkot': 'बागलकोट',
  'haveri': 'हावेरी',
  'karwar': 'कारवार',
  'koppal': 'कोप्पल',
  'yadgir': 'यादगीर',
  'gokak': 'गोकाक',
  'sirsi': 'सिरसी',
  'nipani': 'निपाणी',
  'dandeli': 'दांदेली',

  // Areas & Streets
  'gandhi road': 'गांधी रोड',
  'station square': 'स्टेशन चौराहा',
  'commercial zone': 'व्यावसायिक क्षेत्र',
  'shopping complex': 'शॉपिंग कॉम्प्लेक्स',
  'station road': 'स्टेशन रोड',
  'bus stand': 'बस स्टैंड',
  'railway station': 'रेलवे स्टेशन',
  'road': 'रोड',
  'street': 'गली',
  'circle': 'चौराहा',
  'cross': 'क्रॉस',
  'main': 'मेन',
  'layout': 'लेआउट',
  'nagar': 'नगर',
  'colony': 'कॉलोनी',
  'central': 'मध्य',
  'north': 'उत्तर',
  'south': 'दक्षिण',
  'east': 'पूर्व',
  'west': 'पश्चिम',
  'city': 'शहर',
  'town': 'कस्बा',
  'village': 'गांव'
};

export const UI_STRINGS = {
  en: {
    shopRecords: 'Shop Records',
    totalShopsDesc: (shown: number, total: number) => `Showing ${shown} of ${total} total shops`,
    exportExcel: 'Export to Excel',
    searchPlaceholder: 'Search by name, number, or location...',
    allLocations: 'All Locations',
    sortByName: 'Sort by Name',
    sortByLocation: 'Sort by Location',
    slNo: 'Sl. No.',
    shopName: 'Shop Name',
    mobileNumber: 'Mobile Number',
    location: 'Location',
    area: 'Area',
    actions: 'Actions',
    loading: 'Loading shop records...',
    translating: 'Translating records to English...',
    noShopsFound: 'No shops found matching your criteria.',
    copyNumber: 'Copy number',
    numberCopied: 'Number copied!',
    call: 'Call',
    whatsapp: 'WhatsApp',
    deleteShop: 'Delete shop',
    deleteConfirmTitle: 'Delete Shop',
    deleteConfirmMsg: (name: string, num: string) => `Are you sure you want to delete "${name}" (${num})? This action cannot be undone.`,
    deleteButton: 'Delete Shop',
    cancel: 'Cancel',
    deletedSuccess: 'Shop deleted successfully',
    pagination: (from: number, to: number, total: number) => `Showing ${from} to ${to} of ${total} results`,
    language: 'Language',
    selectLanguage: 'Choose Language',
    activeLanguage: 'Active Language',
    allLocationsTranslated: 'All Locations',
    downloadPdf: 'Download PDF',
    downloadWord: 'Download Word',
  },
  kn: {
    shopRecords: 'ಅಂಗಡಿ ದಾಖಲೆಗಳು',
    totalShopsDesc: (shown: number, total: number) => `${total} ಒಟ್ಟು ಅಂಗಡಿಗಳಲ್ಲಿ ${shown} ಅನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ`,
    exportExcel: 'ಎಕ್ಸೆಲ್‌ಗೆ ರಫ್ತು ಮಾಡಿ',
    downloadPdf: 'ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್',
    downloadWord: 'ವರ್ಡ್ ಡೌನ್‌ಲೋಡ್',
    searchPlaceholder: 'ಹೆಸರು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ಸ್ಥಳದ ಮೂಲಕ ಹುಡುಕಿ...',
    allLocations: 'ಎಲ್ಲಾ ಸ್ಥಳಗಳು',
    sortByName: 'ಹೆಸರಿನ ಪ್ರಕಾರ ವಿಂಗಡಿಸಿ',
    sortByLocation: 'ಸ್ಥಳದ ಪ್ರಕಾರ ವಿಂಗಡಿಸಿ',
    slNo: 'ಕ್ರ.ಸಂ.',
    shopName: 'ಅಂಗಡಿಯ ಹೆಸರು',
    mobileNumber: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    location: 'ಸ್ಥಳ',
    area: 'ಪ್ರದೇಶ',
    actions: 'ಕ್ರಿಯೆಗಳು',
    loading: 'ದಾಖಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    translating: 'ದಾಖಲೆಗಳನ್ನು ಕನ್ನಡಕ್ಕೆ ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ...',
    noShopsFound: 'ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ಅಂಗಡಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
    copyNumber: 'ಸಂಖ್ಯೆ ನಕಲಿಸಿ',
    numberCopied: 'ಸಂಖ್ಯೆಯನ್ನು ನಕಲಿಸಲಾಗಿದೆ!',
    call: 'ಕರೆ ಮಾಡಿ',
    whatsapp: 'ವಾಟ್ಸಾಪ್',
    deleteShop: 'ಅಂಗಡಿ ಅಳಿಸಿ',
    deleteConfirmTitle: 'ಅಂಗಡಿ ಅಳಿಸಿ',
    deleteConfirmMsg: (name: string, num: string) => `ನೀವು ಖಚಿತವಾಗಿ "${name}" (${num}) ಅಳಿಸಲು ಬಯಸುವಿರಾ? ಈ ಕ್ರಿಯೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗುವುದಿಲ್ಲ.`,
    deleteButton: 'ಅಳಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    deletedSuccess: 'ಅಂಗಡಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ',
    pagination: (from: number, to: number, total: number) => `${total} ಫಲಿತಾಂಶಗಳಲ್ಲಿ ${from} ರಿಂದ ${to} ತೋರಿಸಲಾಗುತ್ತಿದೆ`,
    language: 'ಭಾಷೆ',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    activeLanguage: 'ಪ್ರಸ್ತುತ ಭಾಷೆ: ಕನ್ನಡ',
    allLocationsTranslated: 'ಎಲ್ಲಾ ಸ್ಥಳಗಳು',
  },
  hi: {
    shopRecords: 'दुकान रिकॉर्ड्स',
    totalShopsDesc: (shown: number, total: number) => `कुल ${total} दुकानों में से ${shown} दिखाई जा रही हैं`,
    exportExcel: 'एक्सेल में निर्यात करें',
    downloadPdf: 'पीडीएफ डाउनलोड',
    downloadWord: 'वर्ड डाउनलोड',
    searchPlaceholder: 'नाम, मोबाइल नंबर या स्थान से खोजें...',
    allLocations: 'सभी स्थान',
    sortByName: 'नाम के अनुसार क्रमबद्ध करें',
    sortByLocation: 'स्थान के अनुसार क्रमबद्ध करें',
    slNo: 'क्र.सं.',
    shopName: 'दुकान का नाम',
    mobileNumber: 'मोबाइल नंबर',
    location: 'स्थान',
    area: 'क्षेत्र',
    actions: 'कार्रवाई',
    loading: 'रिकॉर्ड्स लोड हो रहे हैं...',
    translating: 'रिकॉर्ड्स का हिंदी में अनुवाद किया जा रहा है...',
    noShopsFound: 'आपके मानदंडों से मेल खाने वाली कोई दुकान नहीं मिली।',
    copyNumber: 'नंबर कॉपी करें',
    numberCopied: 'नंबर कॉपी हो गया!',
    call: 'कॉल करें',
    whatsapp: 'व्हाट्सएप',
    deleteShop: 'दुकान हटाएं',
    deleteConfirmTitle: 'दुकान हटाएं',
    deleteConfirmMsg: (name: string, num: string) => `क्या आप वाकई "${name}" (${num}) को हटाना चाहते हैं? यह कार्रवाई वापस नहीं ली जा सकती।`,
    deleteButton: 'हटाएं',
    cancel: 'रद्द करें',
    deletedSuccess: 'दुकान सफलतापूर्वक हटा दी गई',
    pagination: (from: number, to: number, total: number) => `कुल ${total} परिणामों में से ${from} से ${to} दिखाए जा रहे हैं`,
    language: 'भाषा',
    selectLanguage: 'भाषा चुनें',
    activeLanguage: 'सक्रिय भाषा: हिंदी',
    allLocationsTranslated: 'सभी स्थान',
  }
};

/**
 * Checks if a string contains valid target script
 */
export function hasTargetScript(text: string, target: SupportedLanguage): boolean {
  if (!text || target === 'en') return true;
  if (target === 'kn') return /[\u0C80-\u0CFF]/.test(text);
  if (target === 'hi') return /[\u0900-\u097F]/.test(text);
  return false;
}

/**
 * Synchronously translates text using dictionary & transliteration with 0ms delay.
 * Guaranteed to return Kannada or Hindi text for non-empty input!
 */
export function translateSynchronous(text: string, target: SupportedLanguage): string {
  if (!text || !text.trim() || target === 'en') return text;
  
  const clean = text.trim();
  const lower = clean.toLowerCase();
  const dict = target === 'kn' ? DICTIONARY_KN : DICTIONARY_HI;

  // 1. Direct full match in dictionary
  if (dict[lower]) {
    return dict[lower];
  }

  // 2. Word-by-word dictionary match with phonetic fallback
  const words = clean.split(/(\s+|[.,\-/])/);
  const converted = words.map(part => {
    if (!part || /^\s+$/.test(part) || /^[.,\-/0-9]+$/.test(part)) {
      return part;
    }
    const partLower = part.toLowerCase();
    if (dict[partLower]) {
      return dict[partLower];
    }
    // Fallback: rule-based phonetic transliteration
    return transliterateText(part, target);
  }).join('');

  return converted || clean;
}

/**
 * Batch translation with local storage caching, dictionary fallback, and API calls
 */
export async function translateBatch(
  texts: string[],
  target: SupportedLanguage
): Promise<Record<string, string>> {
  if (target === 'en') {
    const identity: Record<string, string> = {};
    texts.forEach(t => { identity[t] = t; });
    return identity;
  }

  const storageKey = `shop_translations_${target}`;
  let localCache: Record<string, string> = {};

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Cleanse cache: only keep entries that actually contain the target script!
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'string' && hasTargetScript(v, target)) {
          localCache[k] = v;
        }
      }
    }
  } catch {
    localCache = {};
  }

  const result: Record<string, string> = {};
  const toFetch: string[] = [];

  for (const text of texts) {
    if (!text || typeof text !== 'string' || !text.trim() || /^\d+$/.test(text.trim())) {
      result[text] = text;
      continue;
    }
    const clean = text.trim();

    // Check cleansed cache
    if (localCache[clean] && hasTargetScript(localCache[clean], target)) {
      result[clean] = localCache[clean];
    } else {
      // Check synchronous dictionary/transliteration immediately
      const instant = translateSynchronous(clean, target);
      if (hasTargetScript(instant, target)) {
        result[clean] = instant;
        localCache[clean] = instant;
      }
      toFetch.push(clean);
    }
  }

  // Update storage immediately with verified synchronous translations
  try {
    localStorage.setItem(storageKey, JSON.stringify(localCache));
  } catch {}

  // Fetch from backend API / MyMemory to get official refined translations if available
  if (toFetch.length > 0) {
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: toFetch, target })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translations) {
          for (const [orig, trans] of Object.entries(data.translations)) {
            if (typeof trans === 'string' && hasTargetScript(trans, target)) {
              localCache[orig] = trans;
              result[orig] = trans;
            }
          }
          try {
            localStorage.setItem(storageKey, JSON.stringify(localCache));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('API translation fallback:', err);
    }
  }

  // Final check: guarantee target script for every non-empty text
  for (const text of texts) {
    const clean = text.trim();
    if (!result[clean] || !hasTargetScript(result[clean], target)) {
      result[clean] = translateSynchronous(clean, target);
    }
  }

  return result;
}
