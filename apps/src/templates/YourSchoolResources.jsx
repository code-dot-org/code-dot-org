import React, {Component} from 'react';
import Radium from 'radium';
import ContentContainer from './ContentContainer';
import Button from './Button';
import styleConstants from '../styleConstants';
import i18n from "@cdo/locale";
import _ from 'lodash';
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
  }
};

class YourSchoolResources extends Component {

  buttons = [
    {
      text: i18n.teachers(),
      path: 'educate'
    },
    {
      text: i18n.administrators(),
      path: 'educate/district'
    },
    {
      text: i18n.parents(),
      path: 'promote/letter'
    },
  ];

  render() {
    return (
      <ContentContainer isRtl={false}>
        {_.chunk(this.buttons, 3).map(
          (rowButtons, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                ...styles.container,
                ...(rowIndex === 0 && styles.regularRow)
              }}
            >
              {rowButtons.map(
                (button, buttonIndex) => (
                  <Button
                    key={buttonIndex}
                    href={pegasus(`/${button.path}`)}
                    color={Button.ButtonColor.teal}
                    icon="angle-right"
                    iconStyle={{fontSize: 40, float: 'right', lineHeight: '70px'}}
                    text={button.text}
                    size={Button.ButtonSize.mega}
                  />
                )
              )}
            </div>
          )
        )}
      </ContentContainer>
    );
  }
}

export default Radium(YourSchoolResources);
