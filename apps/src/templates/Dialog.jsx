import React from 'react';
import Radium from 'radium';
import Button from './Button';
import BaseDialog from './BaseDialog';
import color from '../color';
import {childrenOfType, whenNoChildOfTypes} from '../propTypes';
import locale from '@cdo/locale';

const styles = {
  icon: {
    backgroundSize: 100,
    backgroundPosition: 'bottom',
    backgroundRepeat: 'no-repeat',
    marginTop: -165,
    width: 120,
    height: 200,
    float: 'left',
  },
  title: {
    fontSize: 27,
    lineHeight: '30px',
    marginBottom: 15,
    color: color.purple,
  },
  body: {
    fontSize: 24,
    lineHeight: '27px',
    color: color.purple,
  },
  buttons: {
    marginTop: 10,
  },
  rightButton: {
    float: 'right',
  },
  buttonClear: {
    clear: 'both'
  },
  footer: {
    borderColor: color.light_gray,
    borderStyle: 'solid',
    borderWidth: 0,
    borderTopWidth: 2,
    marginTop: 15,
    paddingTop: 15,
  },
};

export function Title({children}) {
  return (
    <h1 style={styles.title}>
      {children}
    </h1>
  );
}
Title.propTypes = {
  children: React.PropTypes.node,
};

export function Body({children}) {
  return (
    <div style={styles.body}>
      {children}
    </div>
  );
}
Body.propTypes = {
  children: React.PropTypes.node,
};

export function Confirm(props) {
  return <Button type="primary" {...props}>{props.children || locale.dialogOK()}</Button>;
}
Confirm.propTypes = {
  children: React.PropTypes.node,
};

export function Cancel(props) {
  return <Button type="cancel" {...props}>{props.children || locale.dialogCancel()}</Button>;
}
Cancel.propTypes = {
  children: React.PropTypes.node,
};

export function Buttons({children}) {
  children = React.Children.toArray(children);
  var leftChildren = children.slice(0, children.length-1);
  var rightChild = children[children.length - 1];
  return (
    <div style={styles.buttons}>
      <div style={styles.rightButton}>
        {rightChild}
      </div>
      {leftChildren}
      <div style={styles.buttonClear}/>
    </div>
  );
}
Buttons.propTypes = {
  children: childrenOfType(Cancel, Confirm),
};

export function Footer({children}) {
  return (
    <div style={styles.footer}>
      {children}
    </div>
  );
}
Footer.propTypes = {
  children: React.PropTypes.node,
};


export var Icon = Radium(function Icon({src}) {
  return (
    <span style={[styles.icon, {backgroundImage: `url(${src})`}]}/>
  );
});
Icon.propTypes = {
  src: React.PropTypes.string.isRequired,
};

const Dialog = React.createClass({
  propTypes: Object.assign({}, BaseDialog.propTypes, {
    children: childrenOfType(
      Icon,
      Title,
      Body,
      Buttons,
      Footer
    ),
    icon: whenNoChildOfTypes(Icon),
    title: whenNoChildOfTypes(Title),
    body: whenNoChildOfTypes(Body),
    footer: whenNoChildOfTypes(Footer),
    cancelText: whenNoChildOfTypes(Buttons),
    onCancel: whenNoChildOfTypes(Buttons),
    confirmText: whenNoChildOfTypes(Buttons),
    onConfirm: whenNoChildOfTypes(Buttons),
  }),

  render() {
    var children = [];
    if (this.props.icon) {
      children.push(<Icon key="icon" src={this.props.icon}/>);
    }
    if (this.props.title) {
      children.push(<Title key="title">{this.props.title}</Title>);
    }
    if (this.props.body) {
      children.push(<Body>{this.props.body}</Body>);
    }
    children = children.concat(this.props.children);
    if (this.props.cancelText || this.props.onCancel ||
        this.props.confirmText || this.props.onConfirm) {
      var buttons = (
        <Buttons key="buttons">
          {this.props.onCancel &&
           <Cancel onClick={this.props.onCancel}>{this.props.cancelText}</Cancel>}
          {this.props.onConfirm &&
           <Confirm onClick={this.props.onConfirm}>{this.props.confirmText}</Confirm>}
        </Buttons>
      );
      const lastChild = children[children.length - 1];
      if (lastChild && lastChild.type === Footer) {
        children.splice(children.length - 1, 0, buttons);
      } else {
        children.push(buttons);
      }
    }
    if (this.props.footer) {
      children.push(<Footer key="footer">{this.props.footer}</Footer>);
    }
    return (
      <BaseDialog {...this.props} useNewStyle={true}>
        {children}
      </BaseDialog>
    );
  }
});


export default Dialog;

if (BUILD_STYLEGUIDE) {
  Dialog.styleGuideExamples = storybook => {
    return storybook
      .storiesOf('Dialog', module)
      .addStoryTable([
        {
          name: 'basic example',
          description: `The most common scenario is to create a straightforward dialog
                        with an icon, a title, some body content, and a cancel/confirm
                        button. You can do this easily by simply passing the relevant props`,
          story: () => (
            <Dialog
              hideBackdrop={true}
              icon="https://studio.code.org/blockly/media/skins/flappy/static_avatar.png"
              title="Puzzle 3 of 10"
              cancelText="Go Back"
              body='The "when run" block allows you to run code when your game starts.
                    Try setting the level speed and flapping to the target.'
              footer="Try not to become too addicted to flappy bird"
              onCancel={storybook.action("go back")}
              onConfirm={storybook.action("confirm")}
            />
          )
        }, {
          name: 'basic example with dom',
          description: `If you need to monkey around with the components used to generate
                        the dom in the basic example, you can just specify the components
                        directly.`,
          story: () => (
            <Dialog hideBackdrop={true}>
              <Icon src="https://studio.code.org/blockly/media/skins/flappy/static_avatar.png"/>
              <Title>Puzzle 3 of 10</Title>
              <Body>
                The "when run" block allows you to run code when your game starts.
                Try setting the level speed and flapping to the target.
              </Body>
              <Buttons>
                <Cancel>Go Back</Cancel>
                <Confirm />
              </Buttons>
              <Footer>
                Try not to become too addicted to flappy bird
              </Footer>
            </Dialog>
          )
        }, {
          name: 'no icon',
          description: 'This is how the dialog looks when no icon is provided',
          story: () => (
            <Dialog
              hideBackdrop={true}
              title="Puzzle 3 of 10"
              cancelText="Go Back"
              body='The "when run" block allows you to run code when your game starts.
                    Try setting the level speed and flapping to the target.'
              footer="Try not to become too addicted to flappy bird"
              onCancel={storybook.action("go back")}
              onConfirm={storybook.action("confirm")}
            />
          )
        }, {
          name: 'no footer',
          description: 'This is how the dialog looks if you omit a footer',
          story: () => (
            <Dialog
              hideBackdrop={true}
              title="A big decision"
              body="Do you want to go skydiving?"
              confirmText="Yes"
              onCancel={storybook.action("cancel")}
              onConfirm={storybook.action("confirm")}
            />
          )
        }, {
          name: 'no title and only confirm',
          description: `This is how the dialog looks when you omit a title.
                        You can also omit buttons`,
          story: () => (
            <Dialog
              hideBackdrop={true}
              body="Just wanted to tell you something"
              confirmText="Ok"
              onConfirm={storybook.action("confirm")}
            />
          )
        }
      ]);
  };
}
