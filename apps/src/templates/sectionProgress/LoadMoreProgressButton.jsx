import React, {Component} from 'react';
import i18n from '@cdo/locale';
import Button, {ButtonColor} from '@cdo/apps/templates/Button';

const styles = {
  container: {
    clear: 'both',
    padding: '10px 0px'
  }
};

export default class LoadMoreProgressButton extends Component {
  loadMoreStudents = () => {
    console.log("Load more students");
  };

  render() {
    return (
      <div style={styles.container}>
        <Button
          onClick={this.loadMoreStudents}
          text={i18n.loadMoreStudents()}
          color={ButtonColor.gray}
        />
      </div>
    );
  }
}
