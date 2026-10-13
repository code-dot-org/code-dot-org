# `componentLibrary/typography`

> **⚠️ Deprecated**: The DSCO Typography components are deprecated. Use MUI `Typography` from `@mui/material` instead; the theme maps its variants to the design system type scale. See [MIGRATION_STATUS.md](../../MIGRATION_STATUS.md) for overall progress.

## Legacy Documentation

This is a set of Typography components for use in the Code.org component library.
Implements Typography components with our rebranded styles. Part of global rebranding.

### Why there's semanticTag and visualAppearance props?

We're using `semanticTag` prop to define the semantic tag of the element we're going to render (h1, h2, ..., h6, p, strong,
em, figcaption, div), and `visualAppearance` prop to define the components styles based on our Design system styling.

Short explanation is that we in order to use semantic tags correctly we might want to render an h2 element, but make it look like h5 or vice versa.

The long explanation [can be found here](https://github.com/code-dot-org/code-dot-org/pull/51116#discussion_r1159915772)

### Additional styling / rewriting existing styles of the components

Since we're using scss modules and classnames inside, **to overwrite the styles of the components, you need to make sure
overwriting styles has highest styles priority**.

Here are some examples:

```javascript
 // Assuming we want to make h1 element that will look like h5 with a different color than Typography's default.
    <div>
        <Heading1 visualAppearance="heading-sm">
            Some Heading
        </Heading1>
    </div>
// 1. (Recomended) We can use scss module for
//      a) set a classname for a parent element and update h1 in that style

//     <style>
//     .parentDiv {
//       h1 {
//         color: #f00;
//       }
//     }
//     </style>

            <div className={scssModule.parentDiv}>
                <Heading1 visualAppearance="heading-sm">
                    Some Heading
                </Heading1>
            </div>

//      b) set a specific classname for a heading itself

//     <style>
//     h1.customHeadingStyle {
//          color: #f00;
//     }
//     </style>

            <div>
                <Heading1 visualAppearance="heading-sm" className={scssModule.customHeadingStyle}>
                    Some Heading
                </Heading1>
            </div>

// 2. (Not recommended since we're trying to avoid inline styles) Use inline styles:
            <div>
                <Heading1 visualAppearance="heading-lg" style={{color: '#f00'}}>
                    Some Heading
                </Heading1>
            </div>

```

**_Always rely on css selector priority, not the order of stylesheets being loaded._** (Since order of stylesheets load can be changed almost randomly [example here](https://codeai.slack.com/archives/C0T0PNTM3/p1710363328926969))

## Consuming This Package

```javascript
import {Heading1, BodyTwoText, StrongText} from '@code-dot-org/component-library/typography';

<Heading1>Some Heading</Heading1>
<BodyTwoText>Some body text</BodyTwoText>
<BodyTwoText>Some <StrongText>Strong BodyTwo</StrongText> text</BodyTwoText>

// OR

import Typography from '@code-dot-org/component-library/typography';

<Typography semanticTag="h1" visualAppearance="heading-xxl">Some Heading1</Typography>
<Typography semanticTag="p" visualAppearance="body-two">Some body text</Typography>
<Typography semanticTag="div" visualAppearance="body-three">
  <p>Some body text</p>
</Typography>


```

For guidelines on how to use these components and the features they
offer, [visit Storybook](https://code-dot-org.github.io/code-dot-org/component-library-storybook/?path=/docs/designsystem-typography--docs).
Or run storybook locally and go
to [DesignSystem / Typography](http://localhost:6006/?path=/docs/designsystem-typography--docs).
