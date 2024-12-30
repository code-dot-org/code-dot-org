# Change Log pre-1

All of the pre-1 package version are listed here.
Since initially dsco was a part of code-dot-ord/apps build - it initially had 1 Changelog per each DSCO
component/entity. All of that Changelogs will be combined into one in this file grouped by component/entity.

## `componentLibrary/alert`

## [0.3.0](https://github.com/code-dot-org/code-dot-org/pull/62907)

- rewritten `AlertTest` in typescript
- refactored/optimized `AlertTest.tsx`
- minor Changelog formatting update

## [0.2.1](https://github.com/code-dot-org/code-dot-org/pull/62725)

- updated color variables to use primitiveColors.css

## [0.2.0](https://github.com/code-dot-org/code-dot-org/pull/60911)

- updated `Alert` props to support native HTML Div element attributes

## [0.1.0](https://github.com/code-dot-org/code-dot-org/pull/59159)

- implemented component
- added tests
- added storybook
- component is now `Ready for Dev`
- Initial release

## `componentLibrary/button`

## [0.6.1](https://github.com/code-dot-org/code-dot-org/pull/63021)

- minor tertiary white button color update

## [0.6.0](https://github.com/code-dot-org/code-dot-org/pull/62852)

- rewritten `_BaseButtonTest` in typescript
- refactored/optimized `_BaseButtonTest.tsx`
- removed `ButtonTest.jsx` as it turned out to be a set of duplicating tests
- minor docs update

## [0.5.1](https://github.com/code-dot-org/code-dot-org/pull/62829)

- updated color variables to use primitiveColors.css

## [0.5.0](https://github.com/code-dot-org/code-dot-org/pull/59966)

- added `destructive` button color option

## [0.4.1](https://github.com/code-dot-org/code-dot-org/pull/59610)

- updated BaseButton props to support native HTML element attributes

## [0.4.0](https://github.com/code-dot-org/code-dot-org/pull/58636)

- added background fill color to secondary black and white buttons
- added `gray` secondary button
- deprecated `purple` secondary button

## [0.3.0](https://github.com/code-dot-org/code-dot-org/pull/58469)

- added support of all `aria-` attributes by `Button` components

## [0.2.1](https://github.com/code-dot-org/code-dot-org/pull/57764)

- updated link button styles to prevent overrides by application.scss
- added a transparent border to all buttons, so they are the same height
- added a subtle hover transition animation

## [0.2.0](https://github.com/code-dot-org/code-dot-org/pull/56925)

- implemented component
- added tests
- added storybook
- component is now `Ready for Dev`

## [0.1.0](https://github.com/code-dot-org/code-dot-org/pull/54285)

- created component's skeleton
- Initial commit

## `componentLibrary/closeButton`

## [0.4.1](https://github.com/code-dot-org/code-dot-org/pull/62914)

- updated color variables to use `primitiveColors.css`

## [0.4.0](https://github.com/code-dot-org/code-dot-org/pull/62717)

- rewritten `CloseButtonTest` in typescript
- refactored/optimized `CloseButton.test.tsx`

## [0.3.0](https://github.com/code-dot-org/code-dot-org/pull/61754)

- updated `CloseButton` props to support native HTML Div element attributes

## [0.2.0](https://github.com/code-dot-org/code-dot-org/pull/61581)

- added `id` prop to `CloseButton` component
- added `xs` and `s` sizes to `CloseButton` component

## [0.1.0](https://github.com/code-dot-org/code-dot-org/pull/59242)

- implemented component
- added tests
- added storybook
- component is now `Ready for Dev`
- Initial release

## `componentLibrary/common`

## [0.5.2](https://github.com/code-dot-org/code-dot-org/pull/62862)

- updated color variables to use `primitiveColors.css`

## [0.5.1](https://github.com/code-dot-org/code-dot-org/pull/62743)

- updated comments for `colors.css` and `primitiveColors.css` DSCO Variables colors

## [0.5.0](https://github.com/code-dot-org/code-dot-org/pull/62334)

- created `hooks` folder
- added `useBodyScrollLock`, `useDocumentKeydown`, `useEscapeKeyHandler`, `useFocusTrap` hooks
- updated Readme.md

## [0.4.0](https://github.com/code-dot-org/code-dot-org/pull/62023)

- created `common/styles/variables.scss` file
- added `DropdownFormFieldRelatedProps` type constant
- minor `Changelog` refactor by prettier

## [0.3.4](https://github.com/code-dot-org/code-dot-org/pull/60916)

- updated colors.css values
- removed utility colors

## [0.3.2](https://github.com/code-dot-org/code-dot-org/pull/59328)

- added `updatePositionedElementStyles` and `calculatePositionedElementStyles` helper functions
- minor types update

## [0.3.1](https://github.com/code-dot-org/code-dot-org/pull/59609)

- added colors.css which implements all the Semantic and Utility colors

## [0.3.0](https://github.com/code-dot-org/code-dot-org/pull/59500)

- added primitiveColors.css

## [0.2.1](https://github.com/code-dot-org/code-dot-org/pull/54064)

- minor README.md updates

## [0.2.0](https://github.com/code-dot-org/code-dot-org/pull/53657)

- added `styles/mixins.scss`
- added README.md
- added CHANGELOG.md

## [0.1.0](https://github.com/code-dot-org/code-dot-org/pull/52753)

- added `constants.ts`
- added `types.ts`
- Initial commit

## `componentLibrary/dropdown/simpleDropdown`

## [0.8.1](https://github.com/code-dot-org/code-dot-org/pull/62917)

- updated color variables to use `primitiveColors.css`

## [0.8.0](https://github.com/code-dot-org/code-dot-org/pull/62806)

- rewritten `SimpleDropdownTest` in typescript
- refactored/optimized `SimpleDropdownTest.tsx`

## [0.7.1](https://github.com/code-dot-org/code-dot-org/pull/62102)

- added `iconLeft` prop support to `SimpleDropdown`

## [0.7.0](https://github.com/code-dot-org/code-dot-org/pull/62023)

- added `readOnly` state support to `SimpleDropdown`
- added full support of native HTML Select attributes to `SimpleDropdown`
- added `styleAsFormField` support

## [0.6.2](https://github.com/code-dot-org/code-dot-org/pull/61460)

- added `errorMessage` prop to `SimpleDropdown`
- added error state border color to `SimpleDropdown` when `errorMessage` exists
- added `helperMessage` and `helperIcon` props to `SimpleDropdown`

## [0.6.1](https://github.com/code-dot-org/code-dot-org/pull/61181)

- improved `SimpleDropdown` down arrow icon RTL support

## [0.6.0](https://github.com/code-dot-org/code-dot-org/pull/58637)

- added `gray` color `SimpleDropdown`
- fixed `thin` `white` dropdown text color

## [0.5.2](https://github.com/code-dot-org/code-dot-org/pull/58469)

- added support of all `aria-` attributes by `SimpleDropdown` component

## [0.5.1](https://github.com/code-dot-org/code-dot-org/pull/58209)

- minor story update

## [0.5.0](https://github.com/code-dot-org/code-dot-org/pull/57827)

- added dropdownTextThickness prop to allow for setting the font weight of the dropdown text
- removed unnecessary margin-bottom that was fetched from typography styles
- added black and white background color fill

## [0.4.0](https://github.com/code-dot-org/code-dot-org/pull/57105)

- use `width: 100%` instead of `width: auto` as default when styling `select` element.
- style select element with the use of `select` css selector instead of `.dropdown`

## [0.3.0](https://github.com/code-dot-org/code-dot-org/pull/57105)

- moved `SimpleDropdown` to dropdown folder

## [0.2.0](https://github.com/code-dot-org/code-dot-org/pull/56724)

- Added `itemGroups` prop to allow for grouped options in dropdown.

## [0.1.0](https://github.com/code-dot-org/code-dot-org/pull/55514)

- created component's skeleton
- Initial commit

## `componentLibrary/fontAwesomev6Icon`

## [0.5.0](https://github.com/code-dot-org/code-dot-org/pull/62803)

- rewritten `FontAwesomeV6IconTest` in typescript
- refactored/optimized `FontAwesomeV6IconTest.tsx`

## [0.4.0](https://github.com/code-dot-org/code-dot-org/pull/61754)

- updated `FontAwesomeV6Icon` props to support native HTML Element attributes

## [0.3.1](https://github.com/code-dot-org/code-dot-org/pull/61647)

- added new custom icons support
- updated custom icons story to show new custom icons

## [0.3.0](https://github.com/code-dot-org/code-dot-org/pull/61296)

- added support of `iconFamily` which allows to use different icon families (e.g. brands, duotone, custom icons, etc)
- updated stories to show how to use Brands, Duotone, and custom icons

## [0.2.2](https://github.com/code-dot-org/code-dot-org/pull/60788)

- update stories to show how to use fa-brands or any other custom families icons

## [0.2.1](https://github.com/code-dot-org/code-dot-org/pull/58469)

- added support of all `aria-` attributes by `FontAwesomeV6Icon` component

## [0.2.0](https://github.com/code-dot-org/code-dot-org/pull/57228)

- added font awesome icon animation support for `FontAwesomeV6Icon` component

## [0.1.1](https://github.com/code-dot-org/code-dot-org/pull/55797)

- minor documentation updates

## [0.1.0](https://github.com/code-dot-org/code-dot-org/pull/55305)

- Initial commit
- added fontAwesomeV6Icon component
- added storybook
- added tests

## componentLibrary/link

## [0.4.1](https://github.com/code-dot-org/code-dot-org/pull/62863)

- updated color variables to use `primitiveColors.css`

## [0.4.0](https://github.com/code-dot-org/code-dot-org/pull/62719)

- rewritten `LinkTest` in typescript
- refactored/optimized `LinkTest.tsx`

## [0.3.0](https://github.com/code-dot-org/code-dot-org/pull/61754)

- updated `Link` props to support native HTML Element attributes

## [0.2.4](https://github.com/code-dot-org/code-dot-org/pull/61281)

- minor types updates

## [0.2.3](https://github.com/code-dot-org/code-dot-org/pull/61019)

- minor types updates

## [0.2.2](https://github.com/code-dot-org/code-dot-org/pull/59819)

- added support of `role` prop

## [0.2.1](https://github.com/code-dot-org/code-dot-org/pull/59190)

- added support of `text` prop
- link now can have `children` OR `text` prop
- updated README.md

## [0.2.0](https://github.com/code-dot-org/code-dot-org/pull/55202)

- implemented component
- added tests
- added storybook
- component is now `Ready for Dev`

## [0.1.0](https://github.com/code-dot-org/code-dot-org/pull/54284)

- created component's skeleton
- Initial commit

## `componentLibrary/textField`

## [0.4.0](https://github.com/code-dot-org/code-dot-org/pull/62723)

- rewritten `TextFieldTest` in typescript
- refactored/optimized `TextFieldTest.tsx`

## [0.3.0](https://github.com/code-dot-org/code-dot-org/pull/61754)

- updated `TextField` props to support native HTML Element attributes

## [0.2.4](https://github.com/code-dot-org/code-dot-org/pull/61464)

- Added error state border-color to `TextField` component

## [0.2.3](https://github.com/code-dot-org/code-dot-org/pull/60852)

- Added native input props maxLength, minLength, and autoComplete for `TextField` component

## [0.2.2](https://github.com/code-dot-org/code-dot-org/pull/60852)

- Added inputType options and stories for `TextField` component

## [0.2.1](https://github.com/code-dot-org/code-dot-org/pull/59052)

- minor changelog update

## [0.2.0](https://github.com/code-dot-org/code-dot-org/pull/58904)

- Created `TextField` component
- Created stories and tests for `TextField` component
- Created documentation for `TextField` component

## [0.0.1](https://github.com/code-dot-org/code-dot-org/pull/58494)

- Create skeleton for TextField component

## `componentLibrary/tooltip`

## [0.3.1](https://github.com/code-dot-org/code-dot-org/pull/62996)

- allowed `text` prop to be `string | React.ReactNode`

## [0.3.0](https://github.com/code-dot-org/code-dot-org/pull/62745)

- rewritten `TooltipTest` in typescript
- refactored/optimized `TooltipTest.tsx`

## [0.2.3](https://github.com/code-dot-org/code-dot-org/pull/59328)

- minor types update
- moved `updatePositionedElementStyles` to `common/helpers`, used it in WithTooltip

## [0.2.2](https://github.com/code-dot-org/code-dot-org/pull/60245)

- updated `Tooltip` background color to be $light_gray_950;

## [0.2.1](https://github.com/code-dot-org/code-dot-org/pull/59610)

- used DSCO Button component for `Tooltip` stories

## [0.2.0](https://github.com/code-dot-org/code-dot-org/pull/59106)

- Reworked `WithTooltip` to use React Portal for rendering tooltip content outside the DOM hierarchy of the parent
  component. This allows the tooltip to be rendered outside the parent component's overflow boundaries.
- `WithTooltip` is now a recomended way to use `Tooltip` and `TooltipOverlay` components.

## [0.1.0](https://github.com/code-dot-org/code-dot-org/pull/58273)

- Initial release

## `componentLibrary/typography`

## [2.0.2](https://github.com/code-dot-org/code-dot-org/pull/62837)

- updated color variables to use `primitiveColors.css`

## [2.0.1](https://github.com/code-dot-org/code-dot-org/pull/53337)

- add `ExtraStrong` typography element

## [2.0.0](https://github.com/code-dot-org/code-dot-org/pull/52531)

- Move to new typography scale
- Added new typography elements
- visualAppearance prop is now required

### Breaking Changes:

- visualAppearance prop is now required for `<Typography/>`
- -two is now default element size. -one is bigger, -three is smaller version of default size.
  (See typography.module.scss for details)

## [1.1.1](https://github.com/code-dot-org/code-dot-org/commit/bffd2baa37e64873df93557f0209b049c7659e65)

- Use rem instead of em for font sizes

## 1.0.1

- minor improvements

## 1.0.0

- Initial release
