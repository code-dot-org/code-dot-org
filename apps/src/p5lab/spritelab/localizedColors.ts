import localization from '@cdo/apps/localization';

const HTML_COLORS = [
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dodgerblue',
  'feldspar',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgrey',
  'lightgreen',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslateblue',
  'lightslategray',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'violetred',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen',
];

export type LocalizedColorCache = {
  [localizedColor: string]: string;
};

/**
 * This is the localized color cache that maps locales to mappings from a
 * localized color name to the standard html color name.
 */
export const localizedColorCache: {
  [locale: string]: LocalizedColorCache;
} = {};

/**
 * This gives us a hash that maps localized color names to the standard html
 * color name.
 */
export const localizedColors: (locale?: string) => LocalizedColorCache = (
  locale?: string
) => {
  locale ||= localization.locale;
  if (!localizedColorCache[locale]) {
    localizedColorCache[locale] = Object.fromEntries(
      HTML_COLORS.map(htmlColor => [
        localization.translate(htmlColor, ['html-color']),
        htmlColor,
      ])
    );
  }

  return localizedColorCache[localization.locale];
};

/**
 * This will return the real html color string for any localized html color
 * name that we can determine for the current locale.
 */
export const unlocalizeColor = (localizedColor: string, locale?: string) => {
  // Ignore hex colors
  if (localizedColor.match(/^#[0-9a-fA-F]{6}$/)) {
    return localizedColor;
  }

  return localizedColors(locale)[localizedColor] || localizedColor;
};
