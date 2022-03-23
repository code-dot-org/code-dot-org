export const PoetryStandaloneApp = {
  Poetry: 'poetry',
  PoetryHoc: 'poetry_hoc'
};

export const PALETTES = {
  grayscale: [
    '#000000',
    '#333333',
    '#666666',
    '#999999',
    '#CCCCCC',
    '#EEEEEE',
    '#FFFFFF'
  ],
  sky: ['#3878A4', '#82A9B1', '#ECCEC4', '#F8B8A8', '#E4929C', '#7D7095'],
  ocean: ['#7FD0F5', '#3FABE3', '#2C7DBB', '#1D57A0', '#144188', '#061F4B'],
  sunrise: ['#F5DC72', '#F4B94F', '#F48363', '#F15C4C', '#372031'],
  sunset: ['#530075', '#921499', '#E559BB', '#F7B9DD', '#307087', '#123F50'],
  spring: ['#303F06', '#385202', '#547607', '#85AF4C', '#C1E876', '#D7FF6B'],
  summer: ['#FAD0AE', '#F69F88', '#EE6E51', '#BC4946', '#425D19', '#202E14'],
  autumn: ['#484F0C', '#AEA82E', '#EEBB10', '#D46324', '#731B31', '#4A173C'],
  winter: ['#EAECE8', '#E3DDDF', '#D3CEDC', '#A2B6BF', '#626C7D', '#A4C0D0'],
  twinkling: ['#FFC702', '#FC9103', '#F17302', '#B83604', '#7E1301'],
  rainbow: ['#A800FF', '#0079FF', '#00F11D', '#FF7F00', '#FF0900'],
  roses: ['#4C0606', '#86003C', '#E41F7B', '#FF8BA0 ', '#FFB6B3']
};

// Notes:
// - author is not translated.
// - Poems are shown in all languages, unless there is a locale attribute, in which case
//   the poem is shown in the dropdown only for users with that current locale.
// - If the locale attribute is set, then title is used and is not translated.
// - If the locale attribute is set, then linesSplit is used and is not translated.
export const POEMS = {
  hafez: {author: 'Hafez'},
  field: {author: 'Eugene Field'},
  twain: {author: 'Mark Twain'},
  wordsworth: {author: 'William Wordsworth'},
  hughes: {author: 'Langston Hughes'},
  rios: {author: 'Alberto Rios'},
  hopler: {author: 'Jay Hopler'},
  singer: {author: 'Marilyn Singer\nfrom CENTRAL HEATING (Knopf, 2005)'},
  ewing: {author: 'Eve L. Ewing'},
  alexander: {
    author:
      'Kwame Alexander\nfrom "Booked" used by permission of Kwame Alexander'
  },
  harjo: {
    author:
      'Joy Harjo  Copyright © 1983\nfrom SHE HAD SOME HORSES by Joy Harjo.\nUsed by permission of W. W. Norton & Company, Inc.'
  },
  po: {author: 'Li Po'},
  tzu: {author: 'Lao Tzu'},
  taylor: {author: 'Ann Taylor and Jane Taylor'},
  carroll2: {author: 'Lewis Carroll'},
  carroll3: {author: 'Lewis Carroll'},
  rumi1: {author: 'Rumi'},
  rumi2: {author: 'Rumi'},
  hughes1: {author: 'Langston Hughes'},
  lomeli1: {author: 'Caia Lomeli'},
  lomeli2: {author: 'Caia Lomeli'},
  frost: {author: 'Robert Frost'},
  rusinek1: {
    locale: 'pl_pl',
    author: 'Michał Rusinek, Wierszyki domowe, Znak, 2021',
    title: 'WIESZAKI',
    linesSplit: [
      'Wszystkie dzieciaki',
      'wiedzą, co to wieszaki',
      'i że służą one zwłaszcza',
      'do wieszania płaszcza',
      'lub kurtki, lub pelerynki',
      'chłopczyka i dziewczynki.',
      '',
      'Lecz tak naprawdę wieszaki',
      'to są dzikie zwierzaki:',
      'zaczepne, rogate',
      'i okropnie pyskate!',
      'Kto słyszy ich awantury,',
      'chowa się do mysiej dziury.'
    ]
  },
  rusinek2: {
    locale: 'pl_pl',
    author: 'Michał Rusinek, Wierszyki domowe, Znak, 2021',
    title: 'PRYSZNIC',
    linesSplit: [
      'Prysznic to nie jest zabawka.',
      'Prysznic to taka słuchawka',
      'do rozmów międzywannowych',
      'i międzyprysznicowych.',
      ' ',
      'Ważne, by podczas rozmowy',
      'nie przyszło ci czasem do głowy',
      'kręcić kurkiem, uparciuszku,',
      'bo będziesz mieć wodę w uszku!'
    ]
  },
  rusinek3: {
    locale: 'pl_pl',
    author: 'Michał Rusinek, Wierszyki domowe, Znak, 2021',
    title: 'TOSTER',
    linesSplit: [
      'Do czego służy toster?',
      'To bardzo, bardzo proste:',
      'do opiekania grzanek,',
      'kiedy nadchodzi ranek.',
      '  ',
      'A kiedy się pozmienia',
      'tostera ustawienia,',
      'to służyć mu jest dane',
      'i do zwęglania grzanek.',
      '  ',
      'Ech, męczą się górnicy',
      'tak trochę po próżnicy,',
      'bo gdyby mieli toster,',
      'życie by było proste:',
      '  ',
      'Ustawiałby górnik na full',
      'swój toster – i siadał jak król.',
      'A węgiel by robił się sam.',
      'No, mówię wam!'
    ]
  },
  rusinek4: {
    locale: 'pl_pl',
    author: 'Michał Rusinek, Wierszyki domowe, Znak, 2021',
    title: 'WAZON',
    linesSplit: [
      'Bez względu na to, czy w wazonie',
      'stoją żonkile, czy piwonie,',
      'wazon jest przede wszystkim po to,',
      'by dać się czasem rozbić kotom.'
    ]
  },
  rusinek5: {
    locale: 'pl_pl',
    author: 'Michał Rusinek, Wierszyki domowe, Znak, 2021',
    title: 'SŁOIKI',
    linesSplit: [
      'Stoją w piwnicy puste słoiki.',
      'W jednym z nich były raz borowiki,',
      'w innym pieczarki marynowane,',
      'a w jeszcze innym ćwikła wraz z chrzanem.',
      '  ',
      'Gdy ze słoików wszystko zjedzono,',
      'to je umyto i wysuszono.',
      'Zniesiono tutaj ich zapas spory*,',
      'bo mogą przydać się na przetwory.',
      '  ',
      'Ten, kto na podróż w czasie ma chętkę,',
      'może odkręcić jedną zakrętkę:',
      'wtedy ze środka uleci wokół',
      'trochę powietrza – z zeszłego roku!'
    ]
  }
};
