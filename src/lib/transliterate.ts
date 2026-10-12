// Simple rule-based phonetic transliterator for Indian English terms

const KN_CONSONANTS: [string, string][] = [
  ['ksha', 'ಕ್ಷ'], ['tra', 'ತ್ರ'], ['gna', 'ಜ್ಞ'],
  ['khy', 'ಖ್ಯ'], ['shy', 'ಶ್ಯ'], ['chy', 'ಚ್ಯ'],
  ['sh', 'ಶ'], ['ch', 'ಚ'], ['th', 'ತ'], ['dh', 'ಧ'],
  ['ph', 'ಫ'], ['bh', 'ಭ'], ['gh', 'ಘ'], ['jh', 'ಝ'],
  ['k', 'ಕ'], ['g', 'ಗ'], ['j', 'ಜ'], ['t', 'ಟ'],
  ['d', 'ಡ'], ['n', 'ನ'], ['p', 'ಪ'], ['b', 'ಬ'],
  ['m', 'ಮ'], ['y', 'ಯ'], ['r', 'ರ'], ['l', 'ಲ'],
  ['v', 'ವ'], ['w', 'ವ'], ['s', 'ಸ'], ['h', 'ಹ'],
  ['f', 'ಫ'], ['z', 'ಜ'], ['q', 'ಕ'], ['x', 'ಕ್ಸ್']
];

const HI_CONSONANTS: [string, string][] = [
  ['ksha', 'क्ष'], ['tra', 'त्र'], ['gya', 'ज्ञ'],
  ['sh', 'श'], ['ch', 'च'], ['th', 'थ'], ['dh', 'ध'],
  ['ph', 'फ'], ['bh', 'भ'], ['gh', 'घ'], ['jh', 'झ'],
  ['k', 'क'], ['g', 'ग'], ['j', 'ज'], ['t', 'ट'],
  ['d', 'ड'], ['n', 'न'], ['p', 'प'], ['b', 'ब'],
  ['m', 'म'], ['y', 'य'], ['r', 'र'], ['l', 'ल'],
  ['v', 'व'], ['w', 'व'], ['s', 'स'], ['h', 'ह'],
  ['f', 'फ़'], ['z', 'ज़'], ['q', 'क'], ['x', 'क्स']
];

export function transliterateWord(word: string, target: 'kn' | 'hi'): string {
  if (!word || !word.trim()) return word;
  
  // If already contains Kannada or Devanagari script, keep it
  if (target === 'kn' && /[\u0C80-\u0CFF]/.test(word)) return word;
  if (target === 'hi' && /[\u0900-\u097F]/.test(word)) return word;

  const w = word.toLowerCase();
  const pairs = target === 'kn' ? KN_CONSONANTS : HI_CONSONANTS;
  const halant = target === 'kn' ? '್' : '्';
  
  const vowelMatras: Record<string, string> = target === 'kn' ? {
    'aa': 'ಾ', 'a': '', 'ee': 'ೀ', 'i': 'ಿ', 'oo': 'ೂ', 'u': 'ು',
    'e': 'ೆ', 'ai': 'ೈ', 'o': 'ೊ', 'au': 'ೌ'
  } : {
    'aa': 'ा', 'a': '', 'ee': 'ी', 'i': 'ि', 'oo': 'ू', 'u': 'ु',
    'e': 'े', 'ai': 'ै', 'o': 'ो', 'au': 'ौ'
  };

  const initialVowels: Record<string, string> = target === 'kn' ? {
    'aa': 'ಆ', 'a': 'ಅ', 'ee': 'ಈ', 'i': 'ಇ', 'oo': 'ಊ', 'u': 'ಉ',
    'e': 'ಎ', 'ai': 'ಐ', 'o': 'ಒ', 'au': 'ಔ'
  } : {
    'aa': 'आ', 'a': 'अ', 'ee': 'ई', 'i': 'इ', 'oo': 'ऊ', 'u': 'उ',
    'e': 'ए', 'ai': 'ऐ', 'o': 'ओ', 'au': 'औ'
  };

  let i = 0;
  let out = '';
  let prevWasConsonant = false;

  while (i < w.length) {
    // Check initial vowels or standalone vowels
    if (!prevWasConsonant) {
      let matchedVowel = false;
      for (const [v, glyph] of Object.entries(initialVowels)) {
        if (w.startsWith(v, i)) {
          out += glyph;
          i += v.length;
          matchedVowel = true;
          prevWasConsonant = false;
          break;
        }
      }
      if (matchedVowel) continue;
    } else {
      // Previous was consonant, check vowel matras
      let matchedMatra = false;
      for (const [v, matra] of Object.entries(vowelMatras)) {
        if (w.startsWith(v, i)) {
          out += matra;
          i += v.length;
          matchedMatra = true;
          prevWasConsonant = false;
          break;
        }
      }
      if (matchedMatra) continue;
    }

    // Check consonants
    let matchedConsonant = false;
    for (const [c, glyph] of pairs) {
      if (w.startsWith(c, i)) {
        if (prevWasConsonant) {
          out += halant;
        }
        out += glyph;
        i += c.length;
        matchedConsonant = true;
        prevWasConsonant = true;
        break;
      }
    }
    if (matchedConsonant) continue;

    // Default: keep punctuation/number as-is
    out += w[i];
    prevWasConsonant = false;
    i++;
  }

  return out;
}

export function transliterateText(text: string, target: 'kn' | 'hi'): string {
  if (!text) return '';
  return text.split(/(\s+|[.,\-/])/).map(part => {
    if (!part || /^\s+$/.test(part) || /^[.,\-/0-9]+$/.test(part)) {
      return part;
    }
    return transliterateWord(part, target);
  }).join('');
}
