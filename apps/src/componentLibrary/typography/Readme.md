# `componentLibrary/typography`

This is a set of Typography components for use in the Code.org component library.
Implements Typography components with our rebrnded styles. Part of global rebranding.
At some point it will be moved to (https://github.com/code-dot-org/dsco_), however the signature of the components should
remain the same, and we'll just need to update the import statements once it's in that library.

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
        <Heading1 visualApproach="heading-sm">
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
                <Heading1 visualApproach="heading-lg">
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
                <Heading1 visualApproach="heading-lg" className={scssModule.customHeadingStyle}>
                    Some Heading
                </Heading1>
            </div>

// 2. Use inline styles:
            <div>
                <Heading1 visualApproach="heading-lg" style={{color: '#f00'}}>
                    Some Heading
                </Heading1>
            </div>

```




## Consuming This Package


```javascript
import {Heading1, BodyOneText} from './../componentsLibrary/typography';

<Heading1>Some Heading</Heading1>
<BodyOneText>Some body text</BodyOneText>

// OR

import Typography from './../componentsLibrary/typography';

<Typography semanticTag="h1">Some Heading1</Typography>
<Typography semanticTag="p" visualApproach="body-one">Some body text</Typography>


```

For guidelines on how to use these components and the features they offer, [visit Storybook](http://localhost:9001/?path=/story/typography-component--body-one).