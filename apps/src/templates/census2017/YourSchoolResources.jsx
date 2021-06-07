import React, {Component} from 'react';
import ResourceCard from '../studioHomepages/ResourceCard';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

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
          />
        </div>
        <div style={styles.card}>
          <ResourceCard
            title={i18n.teachers()}
            description={i18n.yourSchoolTeacherDesc()}
            buttonText={i18n.yourSchoolTeacherButton()}
            link={pegasus('/educate')}
          />
        </div>
        <div style={styles.card}>
          <ResourceCard
            title={i18n.parentsAndStudents()}
            description={i18n.yourSchoolParentDesc()}
            buttonText={i18n.yourSchoolParentButton()}
            link={pegasus('/help')}
            allowWrap={true}
          />
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 20
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

export default YourSchoolResources;
