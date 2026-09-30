import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import React, {FC} from 'react';

export type GalleryView = 'challenges' | 'projects';

interface GalleryViewSwitcherProps {
  view: GalleryView;
  onChange: (view: GalleryView) => void;
}

// Switches the Tutor+ gallery between the class's challenge submissions and
// its project-level work.
const GalleryViewSwitcher: FC<GalleryViewSwitcherProps> = ({
  view,
  onChange,
}) => (
  <SegmentedButtons
    size="s"
    selectedButtonValue={view}
    buttons={[
      {value: 'challenges', label: 'Extension Activities'},
      {value: 'projects', label: 'Class Projects'},
    ]}
    onChange={value => onChange(value as GalleryView)}
  />
);

export default GalleryViewSwitcher;
