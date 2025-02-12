import {RefObject, useEffect, useMemo, useState} from 'react';

import {EditorType, ScaleMode} from '.';

import styles from './styles.module.scss';

/**
 * Hook that performs a smooth scroll to the middle octave of the notes editor when first opened.
 */
export function useInitialScroll(
  scrollRef: RefObject<HTMLDivElement>,
  editorType: EditorType,
  scaleMode: ScaleMode,
  numDisplayNotes: number
) {
  const [didInitialScroll, setDidInitialScroll] = useState(false);
  const scrollTopOffset = useMemo(() => {
    const {cellHeight, rowGap, displayRows, peekHeight} = styles;
    if (editorType !== 'notes') {
      return 0;
    }

    const notesInOctave = scaleMode === 'chromatic' ? 12 : 7;
    // Scroll so that the middle octave is at the bottom of the editor.
    const topVisibleRow =
      numDisplayNotes - notesInOctave - parseInt(displayRows);

    return (
      topVisibleRow * (parseInt(cellHeight) + parseInt(rowGap)) -
      parseInt(peekHeight)
    );
  }, [numDisplayNotes, editorType, scaleMode]);

  useEffect(() => {
    if (!didInitialScroll && scrollRef.current && scrollTopOffset > 0) {
      scrollRef.current.scrollTo({top: scrollTopOffset, behavior: 'smooth'});
      setDidInitialScroll(true);
    }
  }, [scrollRef, scrollTopOffset, didInitialScroll]);
}
