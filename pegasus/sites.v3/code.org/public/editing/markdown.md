---
title: Markdown
nav: editing_nav
theme: responsive
---

# Markdown

This is a quick introduction to the basic syntax of Markdown that you can use to help style your pages. For a complete reference, see [the official documentation](https://daringfireball.net/projects/markdown/syntax).

## Headers
***
Every page should start with a title like the one above. Simply use one `#` and make sure there is a space after the `#` before your title. As you create content for your page, try and break it up into sections using smaller and smaller headers as needed. Each smaller header is an additional `#`.

[col-50]

### What your code looks like

`# This is a first level header`<br>
`## This is a second level header`<br>
`### This is a third level header`<br>
`#### This is a fourth level header`<br>
`##### This is a fifth level header`<br>
`###### This is a sixth level header`

[/col-50]

[col-50]

### What your page will look like

# This is a first level header
## This is a second level header
### This is a third level header
#### This is a fourth level header
##### This is a fifth level header
###### This is a sixth level header

[/col-50]

<div style="clear:both;"></div>

## Horizontal rule
***
Use three asterisks to create a horizontal rule or horizontal line across the page.

### What your code looks like

```
#### Example Header
***
```

### What your page will look like

#### Example Header
***

## Lists
***
You can list things in one of two ways: either unordered (bullets) or ordered (numbers). For unordered lists, you can use either an asterisk `*` or a hyphen `-`. Ordered lists can be created with `1.` for each item and markdown will automatically number them correctly so you don't have to re-number everything in case you reorder your list. Don't forget to have an extra new line between the list title and your list items.


### What your code looks like

```
This is an unordered list

* Item 1
* Item 2
* Item 3

This is an ordered list

1. Item 1
1. Item 2
1. Item 3
```


### What your page will look like

This is an unordered list

* Item 1
* Item 2
* Item 3

This is an ordered list

1. Item 1
1. Item 2
1. Item 3


## Emphasis
***
To be used sparingly, you can emphasize part of your copy to call out deadlines or other important information.

### What your code looks like

```
* For italic, use *one asterisk* or _one underscore_
* For bold, use **two asterisks** or __two underscores__
* For both, **surround _one underscore_ with two asterisks**
* Or you can also _surround *two asterisks* with one underscore_
```

### What your page will look like

* For italic, use *one asterisk* or _one underscore_
* For bold, use **two asterisks** or __two underscores__
* For both, **surround _one underscore_ with two asterisks**
* Or you can also _surround **two asterisk** with one underscores_

## Links
***
Links can be created by using brackets `[ ]` for the text of the link and parentheses `( )` for the URL or site you want to link to. There are a few kinds of links you can create.

### What your code looks like

```
* [internal relative link](/markdown)
* [internal absolute link](https://code.org/markdown)
* [external absolute link](https://www.youtube.com/watch?v=AI_dayIQWV4)
* Contact us at <support@code.org>
```

### What your page will look like

* This [is a relative link](/markdown) because it links from one Code.org page to another Code.org page. Notice that it doesn't have any root in the URL, so we assume you want to link to https://code.org/markdown. Most of the time you'll want to use a relative link so that it works for any environment like staging (staging.code.org) or production (code.org).
* This [is an absolute link](https://code.org/markdown) because it contains the `https://code.org` root. Use this kind of link when you are including a link in an email template or something that a user will copy so that they always have a production link.
* This is an [absolute link to an external page](https://www.youtube.com/watch?v=AI_dayIQWV4), in this case a YouTube video
* You can also link to an email address by surrounding in `<>`. For example, please contact: <support@code.org>.

## Images
***
You can include any image by first uploading it to Dropbox in the code.org/public/images folder. If you are uploading several images, try to create a folder inside `images/` so you don't upload all of your images in the main images folder. Including an image is very similar to a link, except starting with an exclamation point at the beginning.

### What your code looks like

```
![Diversity in our courses](/images/fit-800/infographics/diversity-courses.png)
```

### What your page will look like

![Diversity in our courses](/images/fit-800/infographics/diversity-courses.png)

<br>

You don't need to manually crop images! When you include an image, you can use special a special fit or fill function to resize your images easily. Simply add `/fit-W` or `/fit-WxH` after `/images` to automatically crop the image to the set width or height. Fit will resize the image proportionately while fill will fill up the defined space and crop out everything else in the image.

### What your code looks like

```
![K5PD](/images/fit-700/k5pd.jpg)
![K5PD](/images/fill-200x400/k5pd.jpg)
```

### What your page will look like

![K5PD](/images/fit-700/k5pd.jpg)
<br><br>
![K5PD](/images/fill-200x400/k5pd.jpg)

<br>

## Tables
***
A table is created using vertical bars to separate columns. Use the vertical bar before the first column and after the last column. A simple table looks like this:

### 3rd Party Educator Resources: Elementary School

| Organization | Curriculum | Professional Development |
| ------------ | ---------- | ------------------------ |
| [Code Studio](/educate/k5) | 4 courses blend online tutorials with “unplugged” activities, FREE   | 1-day weekend workshops across the US, FREE |
| [Project Lead The Way](https://www.pltw.org/our-programs/pltw-launch) | 6 10-hour computer science modules, $750/school | Face-to-face and online, $700 for school-level lead teacher |
| [ScratchEd](http://scratched.gse.harvard.edu/guide) | A 6-unit intro to Scratch, FREE | In-person educator meet-ups and online MOOC, FREE |
| [Tynker](https://www.tynker.com/school/lesson-plan) | Free tools, tutorials, and a 6-hr introductory lesson plan. 200+ lessons with assessments: $399/class, $2,000/school | 2-day PD, $2000/day + travel |

