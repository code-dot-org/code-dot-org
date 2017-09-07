import React, {Component} from 'react';
import ContentContainer from '../ContentContainer';
import ResourceCard from '../studioHomepages/ResourceCard';
import styleConstants from '../../styleConstants';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const contentWidth = styleConstants['content-width'];

const styles = {
  container: {
    width: contentWidth,
    display: "flex",
    justifyContent: "space-between"
  },
  regularRow: {
    marginBottom: 20
  },
  icon: {
    fontSize: 40,
    float: 'right',
    lineHeight: '70px'
  }
};

class YourSchoolResources extends Component {
  render() {
    return (
      <ContentContainer isRtl={false}>
        <div style={styles.container}>
          <ResourceCard
            title={i18n.administrators()}
            description={i18n.yourSchoolAdminDesc()}
            buttonText={i18n.yourSchoolAdminButton()}
            link={pegasus('/educate/district')}
            isRtl={false}
          />
          <ResourceCard
            title={i18n.teachers()}
            description={i18n.yourSchoolTeacherDesc()}
            buttonText={i18n.yourSchoolTeacherButton()}
            link={pegasus('/educate')}
            isRtl={false}
          />
          <ResourceCard
            title={i18n.parents()}
            description={i18n.yourSchoolParentDesc()}
            buttonText={i18n.yourSchoolParentButton()}
            link={pegasus('/help')}
            isRtl={false}
          />
        </div>
      </ContentContainer>
    );
  }
}

export default YourSchoolResources;
