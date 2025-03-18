'use client';
import type {InternationalFontLocale} from '@/constants';
import {useEffect, useState} from 'react';
import {getFontByLocale} from '@/resolver/getFontByLocale';

interface FontLoaderProps {
  locale: InternationalFontLocale;
}

/**
 * This client-side only component retrieves the appropriate fallback font for a given locale.
 *
 * Fallback fonts are loaded by dynamically importing the appropriate CSS Module for the given locale.
 * This CSS Module will contain the `className` to use to gain entry into the CSS Module. It is then attached
 * to an empty div to allow the browser to utilize the font and gain entry to its font face.
 */
const FontLoader = ({locale}: FontLoaderProps) => {
  const [fontModuleClassName, setFontModuleClassName] = useState(undefined);

  useEffect(() => {
    // This callback should run once, as `getFontByLocale` will return false if no fallback is available.
    if (fontModuleClassName !== undefined) {
      return;
    }

    getFontByLocale(locale).then(fontLocale =>
      setFontModuleClassName(fontLocale.className),
    );
  }, []);

  // If the locale has no fallback font, do not render anything.
  return fontModuleClassName ? <div className={fontModuleClassName} /> : null;
};

export default FontLoader;
