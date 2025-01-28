import React from 'react';

import {Heading3, BodyTwoText} from '@cdo/apps/componentLibrary/typography';

export interface TeacherHomepageV2Props {
  headline: string;
  descriptionText: string | null;
}
export const TeacherHomepageV2: React.FC<TeacherHomepageV2Props> = ({
  headline,
  descriptionText,
}) => {
  return (
    <div>
      <Heading3>{headline}</Heading3>
      <BodyTwoText>{descriptionText}</BodyTwoText>
    </div>
  );
};

// export default connect(state => ({}), {beginGoogleImportRosterFlow})(
//   TeacherHomepageV2
// );
