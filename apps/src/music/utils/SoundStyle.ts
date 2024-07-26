import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import {SoundType} from '../player/MusicLibrary';

import styles from '../views/SoundStyle.module.scss';

type SoundStyle = {
  [key in SoundType | PlaybackEvent['type']]?: {
    // The Font Awesome icon name.
    icon: string;
    // The Font Awesome icon in Unicode, used for rendering an icon as an SVG text element.
    iconCode: string;
    // Left margin to help center the icon, used for an SVG text element.
    marginLeft: number;
    // Class name for the color style attribute.
    classNameColor: string;
    // Class name for the fill style attribute, used for an SVG text element.
    classNameFill: string;
    // Class name for the background-color style attribute.
    classNameBackground: string;
    // Class name for the border-color style attribute.
    classNameBorder: string;
  };
};

// A centralized collection of styling information for sounds, used by the SoundsPanel,
// FieldSounds, and TimelineElement.

const soundStyle: SoundStyle = {
  beat: {
    icon: 'drum',
    iconCode: '\u{F569}',
    marginLeft: 2,
    classNameColor: styles.soundBeatColor,
    classNameFill: styles.soundBeatFill,
    classNameBackground: styles.soundBeatBackground,
    classNameBorder: styles.soundBeatBorder,
  },
  bass: {
    icon: 'boombox',
    iconCode: '\u{F8a5}',
    marginLeft: 0,
    classNameColor: styles.soundBassColor,
    classNameFill: styles.soundBassFill,
    classNameBackground: styles.soundBassBackground,
    classNameBorder: styles.soundBassBorder,
  },
  lead: {
    icon: 'guitars',
    iconCode: '\u{F8BF}',
    marginLeft: 2,
    classNameColor: styles.soundLeadColor,
    classNameFill: styles.soundLeadFill,
    classNameBackground: styles.soundLeadBackground,
    classNameBorder: styles.soundLeadBorder,
  },
  fx: {
    icon: 'waveform',
    iconCode: '\u{F8F1}',
    marginLeft: 0,
    classNameColor: styles.soundFxColor,
    classNameFill: styles.soundFxFill,
    classNameBackground: styles.soundFxBackground,
    classNameBorder: styles.soundFxBorder,
  },
  vocal: {
    icon: 'microphone',
    iconCode: '\u{F130}',
    marginLeft: 3,
    classNameColor: styles.soundVocalColor,
    classNameFill: styles.soundVocalFill,
    classNameBackground: styles.soundVocalBackground,
    classNameBorder: styles.soundVocalBorder,
  },
  pattern: {
    icon: '',
    iconCode: '',
    marginLeft: 0,
    classNameColor: styles.soundPatternColor,
    classNameFill: styles.soundPatternFill,
    classNameBackground: styles.soundPatternBackground,
    classNameBorder: styles.soundPatternBorder,
  },
  chord: {
    icon: '',
    iconCode: '',
    marginLeft: 0,
    classNameColor: styles.soundChordColor,
    classNameFill: styles.soundPatternFill,
    classNameBackground: styles.soundChordBackground,
    classNameBorder: styles.soundChordBorder,
  },
};

export default soundStyle;
