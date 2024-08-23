# Tutorial Explorer

**Tutorial Explorer** is the standalone React app that delivers the functionality of https://code.org/learn and https://hourofcode.com/learn, the pages commonly known as "slash learn".  It was built for the fourth annual **Hour of Code** in 2016, providing the official catalogue of both first- and third-party **Hour of Code** tutorials in an explorable and filterable interface, and has been used ever since.

At the time of writing, the pages have over 190 million pageviews, with over 130 million of them unique.

![code_learn_screenshot](https://user-images.githubusercontent.com/2205926/127435991-68ff5f7a-d6f8-4dda-9fad-b21e4232ccd1.png)

## Interface

The host page is responsible for providing the header banner, and then embeds the React app.

The app itself provides a grid of tiles, one for each tutorial.  The tile images are lazy-loaded as they are near to being scrolled into view.  Each tile can be clicked to show a popup with additional metadata and a link to launch the tutorial in a new browser tab.  The left/right arrow keys can be used to go forward/back while the popup is showing.

Above and beside the tiles are a variety of filters to help refine the set of tutorials being shown.  The filters include grade range, student experience, creator, platform, subject, activity type, length, and programming language.

It's also possible to change the sort order, either by "Most popular" or "Recommended".  See the discussion below about Variables for information on the default sort order.

On particuarly narrow screens, the filters are no longer shown at the same time as the tiles.  Instead, only tiles are shown at first, and the filters can be toggled to show in their place with a "Filters" button, or dismissed with an "Apply" button.  We show the actual count of filtered tutorials in this situation, mainly because the changing set of tutorials isn't visible when only the filters are showing; the count helps indicate when changing a filter is making a difference.

When visiting the page in a non-en language, it first shows a set of tiles for "Activities in your language", that is tutorials that we know have explicit support for that language.  Below this set of tiles is a button which, when pressed, reveals the larger set of tutorials and filter options.

## Responsive

The UI renders a layout that varies with different browser window widths.  A simple new system was introduced [here](https://github.com/code-dot-org/code-dot-org/blob/929fb8fffe8c70817630627df5766bf2c706d9fc/apps/src/tutorialExplorer/responsive.jsx), and is inspired by Bootstrap, which we were using in other parts of our site at the time.

There are a few functions provided.  Here is how one of them can be used:
```
width: getResponsiveValue({lg: 33.3333333, sm: 50, xs: 100})
```

Depending upon the current browser width, and whether that's considered "large", "small", or "extra-small", a different width can be applied to a given element.  (And in the case of the browser being at "medium", the function falls down to use the "small" value, since a "medium" one isn't provided.)

## Algorithm

At the core of the app is a filtering algorithm, implemented in the [`filterTutorials` function](
https://github.com/code-dot-org/code-dot-org/blob/929fb8fffe8c70817630627df5766bf2c706d9fc/apps/src/tutorialExplorer/tutorialExplorer.js#L357-L477).  The comments describe its behavior with some detail.  Its role is to translate the user's choices in the user interface to an appropriate subset of the entire tutorial set.

Care was taken to [unit test](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/test/unit/tutorialExplorer/TutorialExplorerTest.js) this functionality.

## Components

Each React component is in its own file with a brief comment at the top describing its use.

Here are some notable components, and their hierarchy:

- `TutorialExplorer`
	- `FilterHeader`: the set of filters at the top
		- `FilterGroupHeaderSelection`: used for two filters
	- `FilterSet`: the set of filters on the left side
		- `FilterGroupSortBy`: the "Sort by" dropdown
		- `FilterGroupOrgNames`: the "Organization" dropdown
		- `FilterGroup`: a variety of filter groups
			- `FilterChoice`: a variety of filter options with checkboxes
  	- `TutorialSet`: the tutorial tiles
  		- `Tutorial`: an individual tile
  		- `TutorialDetail`: a popup with information about a tutorial
  	- `ToggleAllTutorialsButton`: a button to toggle showing all tutorials, for non-English users


## Analytics

When a tutorial is started, we open it in a new browser tab.  Since the **Tutorial Explorer** tab remains in existence, we simply generate a couple Google Analytics events at the same time, as seen [here](https://github.com/code-dot-org/code-dot-org/blob/929fb8fffe8c70817630627df5766bf2c706d9fc/apps/src/tutorialExplorer/tutorialDetail.jsx#L47-L48).

## Mobile detection

There is some rudimentary [detection for mobile devices](https://github.com/code-dot-org/code-dot-org/blob/929fb8fffe8c70817630627df5766bf2c706d9fc/apps/src/tutorialExplorer/util.jsx#L108-L132).  If a mobile device is successfully detected, the Android & iOS options are initially checked.

## URL parameters

It is possible to pass a custom URL to `/learn` to pre-select the filters shown.

Here's a simple example:
```
https://hourofcode.com/learn?platform=no-computers
```

This says that for filter `platform`, entry `no-computers` should be selected.

It's also possible to specify multiple filter entries, even for the same filter, for example:
```
https://hourofcode.com/learn?grade=pre&grade=2-5&platform=no-computers
```

Here is a full list of the filter names & entries that can be specified:
```
grade: pre, 2-5, 6-8, 9+
teacher_experience: beginner, comfortable
student_experience: beginner, comfortable
platform: computers, android, ios, no-internet, no-computers
subject: science, math, history, la, art, cs-only
activity_type: online-tutorial, lesson-plan
length: 1hour, 1hour-follow, few-hours
programming_language: blocks, typing, other
```

**Important note:** In order to ensure satisfactory web performance, list these parameters in the order of the above list.  (This will allow each variant to be cached as one.)

For example, do not specify: https://hourofcode.com/learn?subject=science&platform=computers

Instead, specify: https://hourofcode.com/learn?platform=computers&subject=science
