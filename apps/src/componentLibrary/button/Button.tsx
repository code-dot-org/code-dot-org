import React from 'react';
import classNames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from './button.module.scss';

export interface ButtonProps {
  /** Button type */
  type: string;
  /** Custom class name */
  className?: string;
  /** Button id */
  id?: string;
  /** Button color */
  color?: string;
  /** Button text */
  text: string;
  /** Is button disabled */
  disabled?: boolean;
  /** Is button pending */
  isPending?: boolean;
  /** Button pending text */
  pendingText?: string;
  /** Is Button styled as text */
  styleAsText?: boolean;
  /** Button aria-label */
  ariaLabel?: string;
  /** Size of button */
  size?: ComponentSizeXSToL;

  // TODO: Add iconLeft and iconRight props
  iconLeft?: string;
  iconRight?: string;

  /** Button onClick target (when used as link) */
  target?: string;
  /** Button href */
  href?: string;
  /** Button download (when used as link) */
  download?: boolean | string;
  /** Button title */
  title?: string;

  /** Button onClick */
  // TODO: Do we need event here?
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button value */
  value: string;

  /** Button tabIndex */
  // TODO: Do we need this prop?
  tabIndex?: number;
}

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/ButtonTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Button Component.
 * Can be used to render a button or as a part of bigger/more complex components (e.g. Some forms, blocks/cards).
 */
const Button: React.FunctionComponent<ButtonProps> = ({size = 'm'}) => {
  return (
    <button
      type="button"
      className={classNames(moduleStyles.link, moduleStyles[`link-${size}`])}
    >
      someText
    </button>
  );
};

export default Button;

//
// /**
//  * New style button.
//  * This particular button is designed to operate in contexts where we have a solid
//  * background. When we're a button on top of an image, we may want something different.
//  */
// import _ from 'lodash';
// import React from 'react';
// import PropTypes from 'prop-types';
// import FontAwesome from '@cdo/apps/templates/FontAwesome';
// import classNames from 'classnames';
// import moduleStyles from './button.module.scss';
//
// // Note: Keep these constants in sync with button.module.scss.
// const Phase1ButtonColor = {
//   brandSecondaryDefault: 'brandSecondaryDefault',
//   neutralDark: 'neutralDark',
// };
//
// const ButtonColor = {
//   ...Phase1ButtonColor,
//   orange: 'orange',
//   gray: 'gray',
//   blue: 'blue',
//   teal: 'teal',
//   white: 'white',
//   red: 'red',
//   green: 'green',
//   purple: 'purple',
// };
//
// const ButtonSize = {
//   default: 'default',
//   large: 'large',
//   narrow: 'narrow',
//   small: 'small',
// };
//
// const ButtonHeight = {
//   default: 34,
//   large: 40,
//   narrow: 40,
//   small: 20,
// };
//
// class Button extends React.Component {
//   static propTypes = {
//     type: PropTypes.oneOf(['button', 'submit', 'reset']),
//     className: PropTypes.string,
//     href: PropTypes.string,
//     text: PropTypes.string,
//     value: PropTypes.oneOfType([
//       PropTypes.string,
//       PropTypes.number,
//       PropTypes.bool,
//     ]),
//     children: PropTypes.node,
//     size: PropTypes.oneOf(Object.keys(ButtonSize)),
//     color: PropTypes.oneOf(Object.values(ButtonColor)),
//     styleAsText: PropTypes.bool,
//     icon: PropTypes.string,
//     iconClassName: PropTypes.string,
//     iconStyle: PropTypes.object,
//     target: PropTypes.string,
//     style: PropTypes.object,
//     disabled: PropTypes.bool,
//     download: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
//     onClick: PropTypes.func,
//     id: PropTypes.string,
//     tabIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
//     isPending: PropTypes.bool,
//     pendingText: PropTypes.string,
//     useDefaultLineHeight: PropTypes.bool,
//     __useDeprecatedTag: PropTypes.bool,
//     'aria-label': PropTypes.string,
//     title: PropTypes.string,
//   };
//
//   onKeyDown = event => {
//     const {href, disabled, onClick} = this.props;
//     if (event.key === 'Enter' && !disabled && !href) {
//       event.preventDefault();
//       event.stopPropagation();
//       onClick();
//     }
//   };
//
//   render() {
//     const {
//       type,
//       color = ButtonColor.orange,
//       size = ButtonSize.default,
//       href,
//       text,
//       styleAsText,
//       icon,
//       iconClassName,
//       iconStyle,
//       target,
//       style,
//       onClick,
//       disabled,
//       download,
//       id,
//       tabIndex,
//       isPending,
//       pendingText,
//       value,
//       useDefaultLineHeight,
//       __useDeprecatedTag,
//       'aria-label': ariaLabel,
//       title,
//     } = this.props;
//
//     if (!href && !onClick) {
//       throw new Error('Expect at least one of href/onClick');
//     }
//
//     let buttonStyle = style;
//     let Tag = 'button';
//     /*
//     TODO: Rework __useDeprecatedTag logic once the remaining instances are only
//     links. The tag is safe to remove from current <Button> implementations if
//     the button has an onClick() and no href. Such removal may require style
//     updates for margin and boxShadow to match page styling.
//     */
//     if (__useDeprecatedTag) {
//       Tag = href ? 'a' : 'div';
//     } else {
//       // boxShadow should default to none, unless otherwise overridden
//       buttonStyle = {boxShadow: 'none', ...style};
//     }
//
//     if (download && Tag !== 'a') {
//       // <button> and <div> elements do not support the download attribute, so
//       // don't let this component attempt to do that.
//       throw new Error(
//           'Attempted to use the download attribute with a non-anchor tag'
//       );
//     }
//
//     const sizeClassNames = __useDeprecatedTag
//         ? [
//           moduleStyles[size],
//           Phase1ButtonColor[color] ? moduleStyles.phase1Updated : '',
//         ]
//         : [moduleStyles[size], !useDefaultLineHeight && moduleStyles.updated];
//
//     // Opening links in new tabs with 'target=_blank' is inherently insecure.
//     // Unfortunately, we depend on this functionality in a couple of place.
//     // Fortunately, it is possible to partially mitigate some of the insecurity
//     // of this functionality by using the `rel` tag to block some of the
//     // potential exploits. Therefore, we do so here.
//     const rel = target === '_blank' ? 'noopener noreferrer' : undefined;
//
//     let className;
//     if (styleAsText) {
//       className = classNames(
//           this.props.className,
//           moduleStyles.main,
//           moduleStyles.textButton,
//           'button-active-no-border',
//           color === ButtonColor.brandSecondaryDefault &&
//           moduleStyles.rebrandedTextButton
//       );
//     } else {
//       className = classNames(
//           this.props.className,
//           moduleStyles.main,
//           moduleStyles[color],
//           sizeClassNames
//       );
//     }
//
//     const buttonProps = Tag === 'button' ? {type} : {};
//
//     return (
//         <Tag
//             {...buttonProps}
//             className={className}
//             style={{...buttonStyle}}
//             href={disabled ? '#' : href}
//             target={target}
//             value={value}
//             rel={rel}
//             disabled={disabled}
//             download={download}
//             onClick={disabled ? null : onClick}
//             onKeyDown={this.onKeyDown}
//             tabIndex={tabIndex}
//             id={id}
//             aria-label={ariaLabel}
//             title={title}
//         >
//           <div style={_.pick(style, ['textAlign'])}>
//             {icon && (
//                 <FontAwesome
//                     icon={icon}
//                     className={classNames(iconClassName, moduleStyles.icon)}
//                     style={{...iconStyle}}
//                 />
//             )}
//             {this.props.children && this.props.children}
//             {isPending && pendingText && (
//                 <span>
//               {pendingText}&nbsp;
//                   <FontAwesome icon="spinner" className="fa-spin" />
//             </span>
//             )}
//             <span className={moduleStyles.textSpan}>{!isPending && text}</span>
//           </div>
//         </Tag>
//     );
//   }
// }
//
// Button.ButtonColor = ButtonColor;
// Button.ButtonSize = ButtonSize;
// Button.ButtonHeight = ButtonHeight;
//
// export default Button;

