import React, {useState} from 'react';
import InteractionsTable from './InteractionsTable';
import AccessControls from './AccessControls';
import SectionAccessToggle from './SectionAccessToggle';
import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons/SegmentedButtons';

/**
 * Renders table of student chat messages and toggles to control student access to AI Tutor.
 */
interface TutorTabProps {
  sectionId: number;
}

export const TAB_NAMES = {
  ACCESS: 'access',
  INTERACTIONS: 'interactions',
};

const TutorTab: React.FC<TutorTabProps> = ({sectionId}) => {
  const [selectedTab, setSelectedTab] = useState(TAB_NAMES.ACCESS);

  return (
    <div>
      <SectionAccessToggle sectionId={sectionId} />
      <SegmentedButtons
        className="ai-tutor-tab-buttons"
        selectedButtonValue={selectedTab}
        size="s"
        buttons={[
          {label: 'View Access Controls', value: TAB_NAMES.ACCESS},
          {
            label: 'View Interactions',
            value: TAB_NAMES.INTERACTIONS,
          },
        ]}
        onChange={setSelectedTab}
      />
      {selectedTab === TAB_NAMES.ACCESS && (
        <AccessControls sectionId={sectionId} />
      )}
      {selectedTab === TAB_NAMES.INTERACTIONS && (
        <InteractionsTable sectionId={sectionId} />
      )}
    </div>
  );
};

export default TutorTab;
