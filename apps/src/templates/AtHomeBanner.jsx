import React from 'react';
import Button from './Button';
import color from '../util/color';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

export default class AtHomeBanner extends React.Component {
  styles = {
    announcement: {
      textAlign: 'center',
      backgroundColor: color.purple,
      color: 'white',
      fontSize: 18,
      padding: 16,
      overflow: 'hidden'
    },
    content: {
      backgroundColor: color.purple,
      color: color.white
    },
    icon: {
      float: 'left',
      fontSize: 60,
      paddingRight: 30
    },
    texts: {
      fontFamily: "'Gotham 4r', sans-serif",
      float: 'left',
      textAlign: 'left'
    },
    text: {
      paddingTop: 7,
      paddingBottom: 5
    },
    button: {
      color: color.white,
      fontSize: 18,
      backgroundColor: color.purple,
      borderColor: color.white,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderBottomLeftRadius: 3,
      borderBottomRightRadius: 3,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
      minWidth: 230,
      height: 40,
      paddingLeft: 30,
      paddingRight: 30,
      boxShadow: 'none',
      ':hover': {
        color: color.white,
        borderColor: color.white,
        backgroundColor: color.purple
      }
    }
  };

  render() {
    return (
      <a href={pegasus('/athome')}>
        <div
          className="special_2020_announcement"
          style={this.styles.announcement}
        >
          <div className="container_responsive">
            <div className="col-66" style={this.styles.content}>
              <div className="icon tablet-feature">
                <i className="fa fa-home" style={this.styles.icon} />
              </div>
              <div className="texts" style={this.styles.texts}>
                <div className="text" style={this.styles.text}>
                  {i18n.atHomeBannerBody1()}
                </div>
                <div className="text">{i18n.atHomeBannerBody2()}</div>
              </div>
            </div>
            <div className="col-33" style={this.styles.content}>
              <Button
                style={this.styles.button}
                text={i18n.atHomeBannerLinkText()}
                href={pegasus('/athome')}
              />
            </div>
          </div>
        </div>
      </a>
    );
  }
}
