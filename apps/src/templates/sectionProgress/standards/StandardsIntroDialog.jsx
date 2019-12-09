import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Portal from 'react-portal';
import i18n from '@cdo/locale';
import Dialog, {Title, Body} from '@cdo/apps/templates/Dialog';
import color from '@cdo/apps/util/color';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

const styles = {
  description: {
    color: color.dark_charcoal
  },
  boldText: {
    fontFamily: '"Gotham 7r", sans-serif'
  }
};

export class StandardsIntroDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired
  };

  render() {
    return (
      <Dialog
        isOpen={this.props.isOpen}
        confirmText={i18n.gotIt()}
        onConfirm={this.props.handleConfirm}
      >
        <Title>{i18n.progressOnCSTAStandards()}</Title>
        <Body>
          <div style={styles.description}>
            <p>
              {i18n.progressOnCSTAStandardsDescription()}{' '}
              <a
                href="https://www.csteachers.org/page/standards"
                target="_blank"
                style={styles.boldText}
              >
                {i18n.CSTAStandards()}
              </a>
            </p>
          </div>
          <div style={styles.description}>
            <p>{i18n.useToView()}</p>
            <ul>
              <li>
                <SafeMarkdown markdown={i18n.useToViewList1()} />
              </li>
              <li>
                <SafeMarkdown markdown={i18n.useToViewList2()} />
              </li>
              <li>
                <SafeMarkdown markdown={i18n.useToViewList3()} />
              </li>
            </ul>
          </div>
          <div style={styles.description}>
            <p>
              <SafeMarkdown markdown={i18n.standardsReminder()} />
            </p>
          </div>
        </Body>
      </Dialog>
    );
  }
}

// Our default export is actually a wrapper around our dialog that renders it
// through a Portal component so it sits at the end of the DOM instead of
// inside whatever component called for it - but this is lousy for testing,
// so we mostly export and test the inner dialog component.
export default class StandardsIntroDialogPortal extends Component {
  static propTypes = StandardsIntroDialog.propTypes;
  render() {
    return (
      <Portal isOpened={this.props.isOpen}>
        <StandardsIntroDialog {...this.props} />
      </Portal>
    );
  }
}
