/**
 * Ankur Cooperative Preeti to Unicode & Nepali Typing Engine
 * Provides high-fidelity Preeti <-> Unicode conversion,
 * live keystroke translation, and keyboard reference layouts.
 */

// Full Preeti ASCII to Unicode Devanagari character map
export const PREETI_CHAR_MAP: Record<string, string> = {
  '÷': '/',
  'v': 'ख',
  'r': 'च',
  '"': 'ू',
  '~': 'ञ्',
  'z': 'श',
  'ç': 'ॐ',
  'f': 'ा',
  'b': 'द',
  'n': 'ल',
  'j': 'व',
  '×': '×',
  'V': 'ख्',
  'R': 'च्',
  'ß': 'द्म',
  '^': '६',
  'Û': '!',
  'Z': 'श्',
  'F': 'ँ',
  'B': 'द्य',
  'N': 'ल्',
  'Ë': 'ङ्ग',
  'J': 'व्',
  '6': 'ट',
  '2': 'द्द',
  '¿': 'रू',
  '>': 'श्र',
  ':': 'स्',
  '§': 'ट्ट',
  '&': '७',
  '£': 'घ्',
  '•': 'ड्ड',
  '.': '।',
  '«': '्र',
  '*': '८',
  '„': 'ध्र',
  'w': 'ध',
  's': 'क',
  'g': 'न',
  'æ': '“',
  'c': 'अ',
  'o': 'य',
  'k': 'प',
  'W': 'ध्',
  'Ö': '=',
  'S': 'क्',
  'Ò': '¨',
  '_': ')',
  '[': 'ृ',
  'Ú': '’',
  'G': 'न्',
  'ˆ': 'फ्',
  'C': 'ऋ',
  'O': 'इ',
  'Î': 'ङ्ख',
  'K': 'प्',
  '7': 'ठ',
  '¶': 'ठ्ठ',
  '3': 'घ',
  '9': 'ढ',
  '?': 'रु',
  ';': 'स',
  "'": 'ु',
  '#': '३',
  '¢': 'द्घ',
  '/': 'र',
  '+': 'ं',
  'ª': 'ङ',
  't': 'त',
  'p': 'उ',
  '|': '्र',
  'x': 'ह',
  'å': 'द्व',
  'd': 'म',
  '`': 'ञ',
  'l': 'ि',
  'h': 'ज',
  'T': 'त्',
  'P': 'ए',
  'Ý': 'ट्ठ',
  '\\': '्',
  'Ù': ';',
  'X': 'ह्',
  'Å': 'हृ',
  'D': 'म्',
  '@': '२',
  'Í': 'ङ्क',
  'L': 'ी',
  'H': 'ज्',
  '4': 'द्ध',
  '±': '+',
  '0': 'ण्',
  '<': '?',
  '8': 'ड',
  '¥': 'र्‍',
  '$': '४',
  '¡': 'ज्ञ्',
  ',': ',',
  '©': 'र',
  '(': '९',
  '‘': 'ॅ',
  'u': 'ग',
  'q': 'त्र',
  '}': 'ै',
  'y': 'थ',
  'e': 'भ',
  'a': 'ब',
  'i': 'ष्',
  '‰': 'झ्',
  'U': 'ग्',
  'Q': 'त्त',
  ']': 'े',
  '˜': 'ऽ',
  'Y': 'थ्',
  'Ø': '्य',
  'E': 'भ्',
  'A': 'ब्',
  'M': 'ः',
  'Ì': 'न्न',
  'I': 'क्ष्',
  '5': 'छ',
  '´': 'झ',
  '1': 'ज्ञ',
  '°': 'ङ्ढ',
  '=': '.',
  'Æ': '”',
  '‹': 'ङ्घ',
  '%': '५',
  '¤': 'झ्',
  '!': '१',
  '-': '(',
  '›': 'द्र',
  ')': '०',
  '…': '‘',
  'Ü': '%',
};

// Post rules for standard Preeti reordering & conjunct resolution
export const PREETI_POST_RULES: [RegExp, string][] = [
  [/्ा/g, ''],
  [/(त्र|त्त)([^उभप]+?)m/g, '$1m$2'],
  [/त्रm/g, 'क्र'],
  [/त्तm/g, 'क्त'],
  [/([^उभप]+?)m/g, 'm$1'],
  [/उm/g, 'ऊ'],
  [/भm/g, 'झ'],
  [/पm/g, 'फ'],
  [/इ{/g, 'ई'],
  [/ि((.्)*[^्])/g, '$1ि'],
  [/(.[ािीुूृेैोौंःँ]*?){/g, '{$1'],
  [/((.्)*){/g, '{$1'],
  [/{/g, 'र्'],
  [/([ाीुूृेैोौंःँ]+?)(्(.्)*[^्])/g, '$2$1'],
  [/्([ाीुूृेैोौंःँ]+?)((.्)*[^्])/g, '्$2$1'],
  [/([ंँ])([ािीुूृेैोौः]*)/g, '$2$1'],
  [/ँँ/g, 'ँ'],
  [/ंं/g, 'ं'],
  [/ेे/g, 'े'],
  [/ैै/g, 'ै'],
  [/ुु/g, 'ु'],
  [/ूू/g, 'ू'],
  [/^ः/g, ':'],
  [/टृ/g, 'ट्ट'],
  [/ेा/g, 'ाे'],
  [/ैा/g, 'ाै'],
  [/अाे/g, 'ओ'],
  [/अाै/g, 'औ'],
  [/अा/g, 'आ'],
  [/एे/g, 'ऐ'],
  [/ाे/g, 'ो'],
  [/ाै/g, 'ौ'],
];

/**
 * Converts a raw Preeti string into standard Devanagari Unicode
 */
export function preetiToUnicode(text: string): string {
  if (!text) return '';
  let output = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    output += PREETI_CHAR_MAP[ch] !== undefined ? PREETI_CHAR_MAP[ch] : ch;
  }
  for (const [pattern, repl] of PREETI_POST_RULES) {
    output = output.replace(pattern, repl);
  }
  return output;
}

/**
 * Basic detection whether a string looks like Preeti encoding
 */
export function isPreetiText(text: string): boolean {
  if (!text || text.length < 3) return false;
  // If it already contains Devanagari characters, it is Unicode
  if (/[\u0900-\u097F]/.test(text)) return false;
  // Common Preeti signature sequences
  const preetiSignatures = [
    ';xsf/L',
    'g]kfn',
    'sf7df',
    'art',
    'C0f',
    'cWoIf',
    'cg\'bfg',
    ';b:o',
    'k|',
    'cª\\s\'/',
    'wd{',
  ];
  return preetiSignatures.some((sig) => text.includes(sig));
}

// Unicode to Preeti reverse mapping for key elements
const UNICODE_TO_PREETI_MAP: [RegExp, string][] = [
  // Numbers
  [/०/g, ')'],
  [/१/g, '!'],
  [/२/g, '@'],
  [/३/g, '#'],
  [/४/g, '$'],
  [/५/g, '%'],
  [/६/g, '^'],
  [/७/g, '&'],
  [/८/g, '*'],
  [/९/g, '('],
  // Vowels
  [/आ/g, 'cf'],
  [/ओ/g, 'cf]'],
  [/औ/g, 'cf}'],
  [/अ/g, 'c'],
  [/ई/g, 'O{'],
  [/इ/g, 'O'],
  [/ऊ/g, 'pm'],
  [/उ/g, 'p'],
  [/ऐ/g, 'P]'],
  [/ए/g, 'P'],
  [/ऋ/g, 'C'],
  [/ॐ/g, 'ç'],
  // Conjuncts
  [/क्त/g, 'Qm'],
  [/क्र/g, 'qm'],
  [/क्ष/g, 'If'],
  [/ज्ञ/g, '1'],
  [/त्र/g, 'q'],
  [/श्र/g, '>'],
  [/द्व/g, 'å'],
  [/द्य/g, 'B'],
  [/द्ध/g, '4'],
  [/द्द/g, '2'],
  [/ट्ट/g, '§'],
  [/ठ्ठ/g, '¶'],
  [/ड्ड/g, '•'],
  [/त्त/g, 'Q'],
  [/न्न/g, 'Ì'],
  [/झ/g, '´'],
  [/फ/g, 'km'],
  // Consonants
  [/क/g, 's'],
  [/ख/g, 'v'],
  [/ग/g, 'u'],
  [/घ/g, '3'],
  [/ङ/g, 'ª'],
  [/च/g, 'r'],
  [/छ/g, '5'],
  [/ज/g, 'h'],
  [/ञ/g, '`'],
  [/ट/g, '6'],
  [/ठ/g, '7'],
  [/ड/g, '8'],
  [/ढ/g, '9'],
  [/ण/g, '0f'],
  [/त/g, 't'],
  [/थ/g, 'y'],
  [/द/g, 'b'],
  [/ध/g, 'w'],
  [/न/g, 'g'],
  [/प/g, 'k'],
  [/ब/g, 'a'],
  [/भ/g, 'e'],
  [/म/g, 'd'],
  [/य/g, 'o'],
  [/र/g, '/'],
  [/ल/g, 'n'],
  [/व/g, 'j'],
  [/श/g, 'z'],
  [/ष/g, 'i'],
  [/स/g, ';'],
  [/ह/g, 'x'],
  // Matras
  [/ा/g, 'f'],
  [/ी/g, 'L'],
  [/ु/g, "'"],
  [/ू/g, '"'],
  [/ृ/g, '['],
  [/े/g, ']'],
  [/ै/g, '}'],
  [/ो/g, 'f]'],
  [/ौ/g, 'f}'],
  [/ं/g, '+'],
  [/ँ/g, 'F'],
  [/ः/g, 'M'],
  [/्/g, '\\'],
  [/।/g, '.'],
];

/**
 * Converts Unicode Devanagari into Preeti representation
 */
export function unicodeToPreeti(text: string): string {
  if (!text) return '';
  let out = text;
  // Handle hraswa ikar reordering: 'कि' -> 'lk'
  out = out.replace(/([क-ह]्?[क-ह]?)ि/g, 'l$1');
  // Handle reph 'र्' before consonant -> consonant + '{'
  out = out.replace(/र्([क-ह])/g, '$1{');
  // Apply mapping rules
  for (const [pattern, repl] of UNICODE_TO_PREETI_MAP) {
    out = out.replace(pattern, repl);
  }
  return out;
}

/**
 * Real-time keypress translator for active Preeti typing in text inputs.
 * Returns the replacement string and caret offset, or null if native keypress.
 */
export function transformPreetiKeypress(
  textBefore: string,
  key: string
): { replacement: string; deleteBackCount: number } | null {
  // Ignore control keys
  if (key.length > 1) return null;

  // 1. Pha modifier 'm':
  // In Preeti: 'k' is प, 'km' is फ.
  if (key === 'm') {
    if (textBefore.endsWith('प')) {
      return { replacement: 'फ', deleteBackCount: 1 };
    }
    if (textBefore.endsWith('त्र')) {
      return { replacement: 'क्र', deleteBackCount: 2 };
    }
    if (textBefore.endsWith('त्त')) {
      return { replacement: 'क्त', deleteBackCount: 2 };
    }
    if (textBefore.endsWith('उ')) {
      return { replacement: 'ऊ', deleteBackCount: 1 };
    }
    if (textBefore.endsWith('भ')) {
      return { replacement: 'झ', deleteBackCount: 1 };
    }
  }

  // 2. Reph '{':
  // Attaches 'र्' to preceding consonant/cluster (e.g. धम + { -> धर्म)
  if (key === '{') {
    if (textBefore.length > 0) {
      // Find the last consonant or cluster
      const lastChar = textBefore[textBefore.length - 1];
      // If previous has matra (e.g. मा)
      if (['ा', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'ं', 'ँ'].includes(lastChar) && textBefore.length > 1) {
        const baseChar = textBefore[textBefore.length - 2];
        return { replacement: 'र्' + baseChar + lastChar, deleteBackCount: 2 };
      }
      return { replacement: 'र्' + lastChar, deleteBackCount: 1 };
    }
    return { replacement: 'र्', deleteBackCount: 0 };
  }

  // 3. 'f' (ा matra) after 'अ' becomes 'आ', or completes 'ण'
  if (key === 'f') {
    if (textBefore.endsWith('अ')) {
      return { replacement: 'आ', deleteBackCount: 1 };
    }
    if (textBefore.endsWith('ण्')) {
      return { replacement: 'ण', deleteBackCount: 2 };
    }
  }

  // 4. ']' (े matra) after 'ा' becomes 'ो', after 'ए' becomes 'ऐ'
  if (key === ']') {
    if (textBefore.endsWith('ा')) {
      return { replacement: 'ो', deleteBackCount: 1 };
    }
    if (textBefore.endsWith('ए')) {
      return { replacement: 'ऐ', deleteBackCount: 1 };
    }
  }

  // 5. '}' (ै matra) after 'ा' becomes 'ौ'
  if (key === '}') {
    if (textBefore.endsWith('ा')) {
      return { replacement: 'ौ', deleteBackCount: 1 };
    }
  }

  // 6. Prefix ikar: 'l' pressed earlier gave 'ि'.
  // Now user types a consonant (e.g. 's' for क -> 'कि')
  if (textBefore.endsWith('ि')) {
    const rawTarget = PREETI_CHAR_MAP[key];
    if (rawTarget && !['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ं', 'ँ', 'ः', '्'].includes(rawTarget)) {
      return { replacement: rawTarget + 'ि', deleteBackCount: 1 };
    }
  }

  // 7. General Preeti character mapping
  if (PREETI_CHAR_MAP[key] !== undefined) {
    return { replacement: PREETI_CHAR_MAP[key], deleteBackCount: 0 };
  }

  // Fallback: return raw key
  return null;
}

export interface PreetiKeyInfo {
  code: string;
  char: string;
  shiftChar: string;
  nepali: string;
  shiftNepali: string;
  label: string;
}

// 4-row interactive visual Preeti keyboard layout reference
export const PREETI_KEYBOARD_ROWS: PreetiKeyInfo[][] = [
  // Number row
  [
    { code: 'Backquote', char: '`', shiftChar: '~', nepali: 'ञ', shiftNepali: 'ञ्', label: 'ञ / ञ्' },
    { code: 'Digit1', char: '1', shiftChar: '!', nepali: 'ज्ञ', shiftNepali: '१', label: 'ज्ञ / १' },
    { code: 'Digit2', char: '2', shiftChar: '@', nepali: 'द्द', shiftNepali: '२', label: 'द्द / २' },
    { code: 'Digit3', char: '3', shiftChar: '#', nepali: 'घ', shiftNepali: '३', label: 'घ / ३' },
    { code: 'Digit4', char: '4', shiftChar: '$', nepali: 'द्ध', shiftNepali: '४', label: 'द्ध / ४' },
    { code: 'Digit5', char: '5', shiftChar: '%', nepali: 'छ', shiftNepali: '५', label: 'छ / ५' },
    { code: 'Digit6', char: '6', shiftChar: '^', nepali: 'ट', shiftNepali: '६', label: 'ट / ६' },
    { code: 'Digit7', char: '7', shiftChar: '&', nepali: 'ठ', shiftNepali: '७', label: 'ठ / ७' },
    { code: 'Digit8', char: '8', shiftChar: '*', nepali: 'ड', shiftNepali: '८', label: 'ड / ८' },
    { code: 'Digit9', char: '9', shiftChar: '(', nepali: 'ढ', shiftNepali: '९', label: 'ढ / ९' },
    { code: 'Digit0', char: '0', shiftChar: ')', nepali: 'ण्', shiftNepali: '०', label: 'ण् / ०' },
    { code: 'Minus', char: '-', shiftChar: '_', nepali: '(', shiftNepali: ')', label: '( / )' },
    { code: 'Equal', char: '=', shiftChar: '+', nepali: '.', shiftNepali: 'ं', label: '. / ं' },
  ],
  // Top row (QWERTY)
  [
    { code: 'KeyQ', char: 'q', shiftChar: 'Q', nepali: 'त्र', shiftNepali: 'त्त', label: 'त्र / त्त' },
    { code: 'KeyW', char: 'w', shiftChar: 'W', nepali: 'ध', shiftNepali: 'ध्', label: 'ध / ध्' },
    { code: 'KeyE', char: 'e', shiftChar: 'E', nepali: 'भ', shiftNepali: 'भ्', label: 'भ / भ्' },
    { code: 'KeyR', char: 'r', shiftChar: 'R', nepali: 'च', shiftNepali: 'च्', label: 'च / च्' },
    { code: 'KeyT', char: 't', shiftChar: 'T', nepali: 'त', shiftNepali: 'त्', label: 'त / त्' },
    { code: 'KeyY', char: 'y', shiftChar: 'Y', nepali: 'थ', shiftNepali: 'थ्', label: 'थ / थ्' },
    { code: 'KeyU', char: 'u', shiftChar: 'U', nepali: 'ग', shiftNepali: 'ग्', label: 'ग / ग्' },
    { code: 'KeyI', char: 'i', shiftChar: 'I', nepali: 'ष्', shiftNepali: 'क्ष्', label: 'ष् / क्ष्' },
    { code: 'KeyO', char: 'o', shiftChar: 'O', nepali: 'य', shiftNepali: 'इ', label: 'य / इ' },
    { code: 'KeyP', char: 'k', shiftChar: 'P', nepali: 'प', shiftNepali: 'ए', label: 'प / ए' },
    { code: 'BracketLeft', char: '[', shiftChar: '{', nepali: 'ृ', shiftNepali: 'र्', label: 'ृ / र्' },
    { code: 'BracketRight', char: ']', shiftChar: '}', nepali: 'े', shiftNepali: 'ै', label: 'े / ै' },
    { code: 'Backslash', char: '\\', shiftChar: '|', nepali: '्', shiftNepali: '्र', label: '् / ्र' },
  ],
  // Home row (ASDF)
  [
    { code: 'KeyA', char: 'a', shiftChar: 'A', nepali: 'ब', shiftNepali: 'ब्', label: 'ब / ब्' },
    { code: 'KeyS', char: 's', shiftChar: 'S', nepali: 'क', shiftNepali: 'क्', label: 'क / क्' },
    { code: 'KeyD', char: 'd', shiftChar: 'D', nepali: 'म', shiftNepali: 'म्', label: 'म / म्' },
    { code: 'KeyF', char: 'f', shiftChar: 'F', nepali: 'ा', shiftNepali: 'ँ', label: 'ा / ँ' },
    { code: 'KeyG', char: 'g', shiftChar: 'G', nepali: 'न', shiftNepali: 'न्', label: 'न / न्' },
    { code: 'KeyH', char: 'h', shiftChar: 'H', nepali: 'ज', shiftNepali: 'ज्', label: 'ज / ज्' },
    { code: 'KeyJ', char: 'j', shiftChar: 'J', nepali: 'व', shiftNepali: 'व्', label: 'व / व्' },
    { code: 'KeyK', char: 'k', shiftChar: 'K', nepali: 'प', shiftNepali: 'प्', label: 'प / प्' },
    { code: 'KeyL', char: 'l', shiftChar: 'L', nepali: 'ि', shiftNepali: 'ी', label: 'ि / ी' },
    { code: 'Semicolon', char: ';', shiftChar: ':', nepali: 'स', shiftNepali: 'स्', label: 'स / स्' },
    { code: 'Quote', char: "'", shiftChar: '"', nepali: 'ु', shiftNepali: 'ू', label: 'ु / ू' },
  ],
  // Bottom row (ZXCV)
  [
    { code: 'KeyZ', char: 'z', shiftChar: 'Z', nepali: 'श', shiftNepali: 'श्', label: 'श / श्' },
    { code: 'KeyX', char: 'x', shiftChar: 'X', nepali: 'ह', shiftNepali: 'ह्', label: 'ह / ह्' },
    { code: 'KeyC', char: 'c', shiftChar: 'C', nepali: 'अ', shiftNepali: 'ऋ', label: 'अ / ऋ' },
    { code: 'KeyV', char: 'v', shiftChar: 'V', nepali: 'ख', shiftNepali: 'ख्', label: 'ख / ख्' },
    { code: 'KeyB', char: 'b', shiftChar: 'B', nepali: 'द', shiftNepali: 'द्य', label: 'द / द्य' },
    { code: 'KeyN', char: 'n', shiftChar: 'N', nepali: 'ल', shiftNepali: 'ल्', label: 'ल / ल्' },
    { code: 'KeyM', char: 'm', shiftChar: 'M', nepali: 'फ (mod)', shiftNepali: 'ः', label: 'm (फ mod) / ः' },
    { code: 'Comma', char: ',', shiftChar: '<', nepali: ',', shiftNepali: '?', label: ', / ?' },
    { code: 'Period', char: '.', shiftChar: '>', nepali: '।', shiftNepali: 'श्र', label: '। / श्र' },
    { code: 'Slash', char: '/', shiftChar: '?', nepali: 'र', shiftNepali: 'रु', label: 'र / रु' },
  ],
];
