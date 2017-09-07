import React, {Component} from 'react';
import ContentContainer from '../ContentContainer';
import Button from '../Button';
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
          <Button
            href={pegasus('/educate')}
            color={Button.ButtonColor.gray}
            icon="angle-right"
            iconStyle={styles.icon}
            text={i18n.teachers()}
            size={Button.ButtonSize.mega}
          />
          <Button
            href={pegasus('/educate/district')}
            color={Button.ButtonColor.gray}
            icon="angle-right"
            iconStyle={styles.icon}
            text={i18n.administrators()}
            size={Button.ButtonSize.mega}
          />
          <Button
            href={pegasus('promote/letter')}
            color={Button.ButtonColor.gray}
            icon="angle-right"
            iconStyle={styles.icon}
            text={i18n.parents()}
            size={Button.ButtonSize.mega}
          />
        </div>
      </ContentContainer>
    );
  }
}

export default YourSchoolResources;
