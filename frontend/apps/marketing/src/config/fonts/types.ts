import {SupportedLocale} from '@/config/locales';
import {NextFontWithVariable} from 'next/dist/compiled/@next/font';

export type FontMapping = {[locale in SupportedLocale]: NextFontWithVariable[]};
export type FontVariableMapping = {[locale in SupportedLocale]: string[]};
