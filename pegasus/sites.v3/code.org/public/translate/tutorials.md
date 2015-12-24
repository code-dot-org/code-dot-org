---
title: Translate Tutorials
nav: translate_nav
---

# Translating the site and tutorials
The majority of our translations are done through CrowdIn, a localization management platform. It is free to join and any volunteer can immediately contribute to the project by providing translations. There are currently three projects open for translations:

* [Code.org Project](https://crowdin.com/project/codeorg) - For the Code.org site and all Code Studio tutorials. Learn more below.
* [Hour of Code Project](https://crowdin.com/project/hour-of-code) - For the HourofCode.com site. Learn more [here](https://code.org/translate/hourofcode).
* [Curriculum Project](https://crowdin.com/project/lesson-plans) - For teacher lesson plans that accompany our courses. Learn more [here](https://code.org/translate/curriculum).

Please complete translations for these projects in the above order of priority. If you have completed translations (at least 75% of the project is complete) and do not see your language in the drop down menu, please send a report to translations@code.org.

## What do I translate first?

1. Please translate our [Star Wars tutorial](/translate/starwars) and our [Minecraft tutorial](/translate/mc) first.
2. Then translate the Code.org homepage and Code.org/learn by completing the pegasus/mobile.yml file in the [Code.org project](https://crowdin.com/project/codeorg).
3. Translate the HourofCode.com homepage by completing the homepage file in the [Hour of Code project](https://crowdin.com/project/hour-of-code).
4. Then come back to the [Code.org project](https://crowdin.com/project/codeorg) to complete the rest of Code Studio tutorials.


## Where can I find context for Code Studio tutorial translations?
If you have more time, complete the project in the following prioritized order.

<br/>
**Code.org homepage and Hour of Code tutorial**

(context: [Code.org](https://code.org), [Hour of Code](https://studio.code.org/hoc/1))

1. pegasus/mobile.yml - search for "homepage"
1. dashboard/data.yml - instructions for levels 1-15, search for "maze\_2"
1. dashboard/instructions.yml - instructions for levels 16-20, search for "Scrat"
1. dashboard/scripts.yml - for the script name and description, search for "Hour of Code"
1. blockly-core/core.json - shared blockly strings between puzzles
1. blockly-mooc/common.json - shared blockly strings between puzzles
1. blockly-mooc/maze.json - for the remainder of maze related blocks

<br/>
**Other Hour of Code tutorials**

(context: [Frozen](https://studio.code.org/s/frozen), [Infinity Play Lab](https://studio.code.org/s/infinity), [Play Lab](https://studio.code.org/s/playlab), [Artist](https://studio.code.org/s/artist), [Flappy](https://studio.code.org/s/flappy))

1. dashboard/instructions.yml
	* search for "Frozen" 
	* search for "Infinity" 
	* search for "Standalone_Artist"
1. dashboard/scripts.yml
	* search for "Frozen" 
	* search for "Infinity" 
	* search for "script -> name -> artist"
1. dashboard/data.yml 
	* search for "studio_playlab" 
	* search for "flappy"	
1. blockly-mooc/turtle.json - for artist levels 
1. blockly-mooc/studio.json - for play lab levels 
1. blockly-mooc/flappy.json

And, Star Wars will be coming soon for translation.

<br/>
**Computer Science Fundamentals courses**

(context: [Accelerated Course](https://studio.code.org/s/20-hour), [Course 1](https://studio.code.org/s/course1), [Course 2](https://studio.code.org/s/course2), [Course 3](https://studio.code.org/s/course3), [Course 4](https://studio.code.org/s/course4))

1. dashboard/data.yml - search for "instructions" for the Accelerated Course
1. dashboard/instructions.yml
 * search for "K-1" for Course 1 instructions
 * search for "2-3" for Course 2 instructions
 * search for "4-5" for Course 3 instructions
 * search for "Course 4" for Course 4 instructions
1. dashboard/scripts.yml - for the course titles, descriptions, and stage names
1. dashboard/data.yml - Accelerated course stage names and callouts
1. dashboard/dsls.yml - Assessment levels like multiple choice and matching
1. dashboard/slides.yml - Abridged video transcripts
1. dashboard/unplugged.yml - Titles and descritions of unplugged activities

<br/>
**Remaining Files**

1. The rest of pegasus/mobile.yml 
	* context: [code.org/learn](https://code.org/learn)
	* context: [teacher-dashboard](https://code.org/teacher-dashboard), viewable only when signed into a teacher account
1. dashboard/base.yml - [Code Studio](https://studio.code.org) strings
1. dashboard/devise.yml - Account related strings
1. blockly-mooc/bounce.json - context: [Bounce](https://studio.code.org/s/course3/stage/15/puzzle/1)
1. blockly-mooc/jigsaw.json - context: [Jigsaw](https://studio.code.org/s/course1/stage/3/puzzle/1)

## How to Use CrowdIn

<embed src="/files/crowdin.swf" width=800 height=550 />

Watch the [demo video](/files/crowdin.swf) in full screen.

## Strings that may still change

Course 4 is still in Beta, so the instructions may still change as we prepare to release it. If you've completed all other translations, you can save these translations for last. We recommend that you still complete them and approve them as they are, and if changes are made then they will be mark as "unapproved" so that you can review and update the translation, if needed.


## How translations are selected

Members of the project are either a translator or proofreader. A translator can provide translations, while a proofreader can both provide translations as well as select the best translation to be used on the site.

The final translation that appears on our site is selected as follows:

1. A proofreader selects the best translation.
2. If there is no translation selected by a proofreader, translators vote on the best translation and the translation with the most votes is selected.
3. if votes are tied, the most recent translation will be selected.


 
---

### Translate Khan Academy coding tutorials to Spanish and Portuguese
Click [here](http://cs-blog.khanacademy.org/2013/10/ayuda-traducir-nuestro-curriculo-en.html) to also help Khan Academy translate their tutorials to Spanish and Portuguese.
