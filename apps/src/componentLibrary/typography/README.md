# `componentLibrary/typography`

This is a set of Typography components for use in the Code.org component library.
Implements Typography components with our rebranded styles. Part of global rebranding.
At some point it will be moved to (https://github.com/code-dot-org/dsco_), however the signature of the components should
remain the same, and we'll just need to update the import statements once it's in that library.

### Why there's semanticTag and visualAppearance props?
We're using `semanticTag` prop to define the semantic tag of the element we're going to render (h1, h2, ..., h6, p, strong,
em, figcaption ), and `visualAppearance` prop to define the components styles based on our Design system styling.

Short explanation is that we in order to use semantic tags correctly we might want to render an h2 element, but make it look like h5 or vice versa.

The long explanation [can be found here](https://github.com/code-dot-org/code-dot-org/pull/51116#discussion_r1159915772)

### Additional styling / rewriting existing styles of the components
Since we're using scss modules and classnames inside, to overwrite the styles of the components, you need to make sure 
overwriting styles has highest styles priority. Here's some examples:

```javascript
 // Assuming we want to make h1 element that will look like h1 with a different color than Typography's default.
    <div>
        <Heading1>
            Some Heading
        </Heading1>
    </div>

// Just add any classname style in your scss module to the Heading1.
//     <style>
//     .heading1Style {
//       color: #f00;
//     }
//     </style>

    <div>
        <Heading1 className={scssModule.heading1Style}>
            Some Heading
        </Heading1>
    </div>

```

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
//     h1 {
//         color: #f00;
//     }
//     </style>

            <div className={scssModule.parentDiv}>
                <Heading1 visualAppearance="heading-lg">
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
                <Heading1 visualAppearance="heading-lg" className={scssModule.customHeadingStyle}>
                    Some Heading
                </Heading1>
            </div>

// 2. Use inline styles:
            <div>
                <Heading1 visualAppearance="heading-lg" style={{color: '#f00'}}>
                    Some Heading
                </Heading1>
            </div>

```




## Consuming This Package


```javascript
import {Heading1, BodyTwoText, StrongText} from './../componentLibrary/typography';

<Heading1>Some Heading</Heading1>
<BodyTwoText>Some body text</BodyTwoText>
<BodyTwoText>Some <StrongText>Strong BodyTwo</StrongText> text</BodyTwoText>

// OR

import Typography from './../componentLibrary/typography';

<Typography semanticTag="h1" visualAppearance="heading-xxl">Some Heading1</Typography>
<Typography semanticTag="p" visualAppearance="body-two">Some body text</Typography>


```

For guidelines on how to use these components and the features they offer, [visit Storybook](http://localhost:9001/?path=/story/typography-component--body-one).
