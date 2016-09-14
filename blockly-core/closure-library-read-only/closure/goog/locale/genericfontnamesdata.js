// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview List of generic font names and font fallbacks.
 * This file lists the font fallback for each font family for each locale or
 * script. In this map, each value is an array of pair. The pair is stored
 * as an array of two elements.
 *
 * First element of the pair is the generic name
 * for the font family in that locale. In case of script indexed entries,
 * It will be just font family name. Second element in the pair is a string
 * comma seperated list of font names. API to access this data is provided
 * thru goog.locale.genericFontNames.
 *
 * Warning: this file is automatically generated from CLDR.
 * Please contact i18n team or change the script and regenerate data.
 * Code location: http://go/generate_genericfontnames
 *
 */


/**
 * Namespace for Generic Font Names
 */
goog.provide('goog.locale.genericFontNamesData');


/**
 * Map from script code or language code to list of pairs of (generic name,
 * font name fallback list).
 * @type {Object}
 */

/* ~!@# genmethods.genericFontNamesData() #@!~ */
goog.locale.genericFontNamesData = {
  'Arab': [
    [
      'sans-serif',
      'Arial,Al Bayan'
    ],
    [
      'serif',
      'Arabic Typesetting,Times New Roman'
    ]
  ],
  'Armn': [[
    'serif',
    'Sylfaen,Mshtakan'
  ]],
  'Beng': [[
    'sans-serif',
    'Vrinda,Lohit Bengali'
  ]],
  'Cans': [[
    'sans-serif',
    'Euphemia,Euphemia UCAS'
  ]],
  'Cher': [[
    'serif',
    'Plantagenet,Plantagenet Cherokee'
  ]],
  'Deva': [
    [
      'sans-serif',
      'Mangal,Lohit Hindi'
    ],
    [
      'serif',
      'Arial Unicode MS,Devanagari'
    ]
  ],
  'Ethi': [[
    'serif',
    'Nyala'
  ]],
  'Geor': [[
    'serif',
    'Sylfaen'
  ]],
  'Gujr': [
    [
      'sans-serif',
      'Shruti,Lohit Gujarati'
    ],
    [
      'serif',
      'Gujarati'
    ]
  ],
  'Guru': [
    [
      'sans-serif',
      'Raavi,Lohit Punjabi'
    ],
    [
      'serif',
      'Gurmukhi'
    ]
  ],
  'Hebr': [
    [
      'sans-serif',
      'Gisha,Aharoni,Arial Hebrew'
    ],
    [
      'serif',
      'David'
    ],
    [
      'monospace',
      'Miriam Fixed'
    ]
  ],
  'Khmr': [
    [
      'sans-serif',
      'MoolBoran,Khmer OS'
    ],
    [
      'serif',
      'DaunPenh'
    ]
  ],
  'Knda': [
    [
      'sans-serif',
      'Tunga'
    ],
    [
      'serif',
      'Kedage'
    ]
  ],
  'Laoo': [[
    'sans-serif',
    'DokChampa,Phetsarath OT'
  ]],
  'Mlym': [
    [
      'sans-serif',
      'AnjaliOldLipi,Kartika'
    ],
    [
      'serif',
      'Rachana'
    ]
  ],
  'Mong': [[
    'serif',
    'Mongolian Baiti'
  ]],
  'Nkoo': [[
    'serif',
    'Conakry'
  ]],
  'Orya': [[
    'sans-serif',
    'Kalinga,utkal'
  ]],
  'Sinh': [[
    'serif',
    'Iskoola Pota,Malithi Web'
  ]],
  'Syrc': [[
    'sans-serif',
    'Estrangelo Edessa'
  ]],
  'Taml': [
    [
      'sans-serif',
      'Latha,Lohit Tamil'
    ],
    [
      'serif',
      'Inai Mathi'
    ]
  ],
  'Telu': [
    [
      'sans-serif',
      'Gautami'
    ],
    [
      'serif',
      'Pothana'
    ]
  ],
  'Thaa': [[
    'sans-serif',
    'MV Boli'
  ]],
  'Thai': [
    [
      'sans-serif',
      'Tahoma,Thonburi'
    ],
    [
      'monospace',
      'Tahoma,Ayuthaya'
    ]
  ],
  'Tibt': [[
    'serif',
    'Microsoft Himalaya'
  ]],
  'Yiii': [[
    'sans-serif',
    'Microsoft Yi Baiti'
  ]],
  'Zsym': [[
    'sans-serif',
    'Apple Symbols'
  ]],
  'jp': [
    [
      '\uff30\u30b4\u30b7\u30c3\u30af',
      'MS PGothic,\uff2d\uff33 \uff30\u30b4\u30b7\u30c3\u30af,Hiragino Kaku G' +
     'othic Pro,\u30d2\u30e9\u30ae\u30ce\u89d2\u30b4 Pro W3,Sazanami Gothic' +
     ',\u3055\u3056\u306a\u307f\u30b4\u30b7\u30c3\u30af,sans-serif'
    ],
    [
      '\u30e1\u30a4\u30ea\u30aa',
      'Meiryo,\u30e1\u30a4\u30ea\u30aa,sans-serif'
    ],
    [
      '\uff30\u660e\u671d',
      'MS PMincho,\uff2d\uff33 \uff30\u660e\u671d,Hiragino Mincho Pro,\u30d2' +
     '\u30e9\u30ae\u30ce\u660e\u671d Pro W3,Sazanami Mincho,\u3055\u3056' +
     '\u306a\u307f\u660e\u671d,serif'
    ],
    [
      '\u7b49\u5e45',
      'MS Gothic,\uff2d\uff33 \u30b4\u30b7\u30c3\u30af,Osaka-Mono,Osaka\uff0d' +
     '\u7b49\u5e45,monospace'
    ]
  ],
  'ko': [
    [
      '\uace0\ub515',
      'Gulim,\uad74\ub9bc,AppleGothic,\uc560\ud50c\uace0\ub515,UnDotum,\uc740' +
     ' \ub3cb\uc6c0,Baekmuk Gulim,\ubc31\ubb35 \uad74\ub9bc,sans-serif'
    ],
    [
      '\ub9d1\uc740\uace0\ub515',
      'Malgun Gothic,\ub9d1\uc740\uace0\ub515,sans-serif'
    ],
    [
      '\ubc14\ud0d5',
      'Batang,\ubc14\ud0d5,AppleMyungjo,\uc560\ud50c\uba85\uc870,UnBatang,' +
     '\uc740 \ubc14\ud0d5,Baekmuk Batang,\ubc31\ubb35 \ubc14\ud0d5,serif'
    ],
    [
      '\uad81\uc11c',
      'Gungseo,\uad81\uc11c,serif'
    ],
    [
      '\uace0\uc815\ud3ed',
      'GulimChe,\uad74\ub9bc\uccb4,AppleGothic,\uc560\ud50c\uace0\ub515,monos' +
     'pace'
    ]
  ],
  'root': [
    [
      'sans-serif',
      'FreeSans'
    ],
    [
      'serif',
      'FreeSerif'
    ],
    [
      'monospace',
      'FreeMono'
    ]
  ],
  'transpose': {
    'zh': {
      'zh_Hant': {
        '\u5b8b\u4f53': '\u65b0\u7d30\u660e\u9ad4',
        '\u9ed1\u4f53': '\u5fae\u8edf\u6b63\u9ed1\u9ad4'
      }
    }
  },
  'ug': [[
    'serif',
    'Microsoft Uighur'
  ]],
  'zh': [
    [
      '\u9ed1\u4f53',
      'Microsoft JhengHei,\u5fae\u8edf\u6b63\u9ed1\u9ad4,SimHei,\u9ed1\u4f53,' +
     'MS Hei,STHeiti,\u534e\u6587\u9ed1\u4f53,Apple LiGothic Medium,\u860b' +
     '\u679c\u5137\u4e2d\u9ed1,LiHei Pro Medium,\u5137\u9ed1 Pro,STHeiti Li' +
     'ght,\u534e\u6587\u7ec6\u9ed1,AR PL ZenKai Uni,\u6587\u9f0ePL\u4e2d' +
     '\u6977Uni,sans-serif'
    ],
    [
      '\u5fae\u8f6f\u96c5\u9ed1\u5b57\u4f53',
      'Microsoft YaHei,\u5fae\u8f6f\u96c5\u9ed1\u5b57\u4f53,sans-serif'
    ],
    [
      '\u5b8b\u4f53',
      'SimSun,\u5b8b\u4f53,MS Song,STSong,\u534e\u6587\u5b8b\u4f53,Apple LiSu' +
     'ng Light,\u860b\u679c\u5137\u7d30\u5b8b,LiSong Pro Light,\u5137\u5b8b' +
     ' Pro,STFangSong,\u534e\u6587\u4eff\u5b8b,AR PL ShanHeiSun Uni,\u6587' +
     '\u9f0ePL\u7ec6\u4e0a\u6d77\u5b8bUni,AR PL New Sung,\u6587\u9f0e PL ' +
     '\u65b0\u5b8b,serif'
    ],
    [
      '\u7d30\u660e\u9ad4',
      'NSimsun,\u65b0\u5b8b\u4f53,monospace'
    ]
  ]
};
/* ~!@# END #@!~ */
