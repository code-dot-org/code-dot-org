import {createContext} from 'react';

export type PalettePosition = 'top' | 'left';

const PalettePositionContext = createContext<PalettePosition>('top');

export default PalettePositionContext;
