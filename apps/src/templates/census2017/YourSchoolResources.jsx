import React, {Component} from 'react';
import ResourceCard from '../studioHomepages/ResourceCard';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const styles = {
  container: {
    width: '100%',
    display: "flex",
    justifyContent: "space-between",
    flexWrap: 'wrap',
  },
  card: {
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
      <div style={styles.container}>
        <div style={styles.card}>
          <ResourceCard
            title={i18n.administrators()}
            description={i18n.yourSchoolAdminDesc()}
            buttonText={i18n.yourSchoolAdminButton()}
            link={pegasus('/educate/district')}
            isRtl={false}
          />
        </div>
        <div style={styles.card}>
          <ResourceCard
            title={i18n.teachers()}
            description={i18n.yourSchoolTeacherDesc()}
            buttonText={i18n.yourSchoolTeacherButton()}
            link={pegasus('/educate')}
            isRtl={false}
          />
        </div>
        <div style={styles.card}>
          <ResourceCard
            title={i18n.parents()}
            description={i18n.yourSchoolParentDesc()}
            buttonText={i18n.yourSchoolParentButton()}
            link={pegasus('/help')}
            isRtl={false}
          />
        </div>
      </div>
    );
  }
}

export default YourSchoolResources;
