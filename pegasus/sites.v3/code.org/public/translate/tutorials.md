---
title: Translate Tutorials
nav: translate_nav
theme: responsive
---

# Translating the site and tutorials
The majority of our translations are done through CrowdIn, a localization management platform. It is free to join and any volunteer can immediately contribute to the project by providing translations. There are currently two projects open for translations:

* [Code.org Project](https://crowdin.com/project/codeorg) - For the Code.org site and all Code Studio tutorials. Learn more below.
* [Hour of Code Project](https://crowdin.com/project/hour-of-code) - For the HourofCode.com site. Learn more [here](https://code.org/translate/hourofcode).


Please complete translations for these projects in the above order of priority. If you have completed translations (at least 75% of the project is complete) and do not see your language in the drop down menu, please send a report to translations@code.org.

## What do I translate first?

1. Please translate our Hour of Code tutorials.
  * [Dance Party](/translate/dance)
  * [Minecraft: Voyage Aquatic](/translate/aquatic)
	* [Minecraft: Hero's Journey](/translate/hero)
	* [Minecraft Designer](/translate/minecraft)
  * [Minecraft Adventurer](/translate/mc)
  * [Star Wars](/translate/starwars)
  * [Sports and Basketball](/translate/sports)
1. Then translate the [Code.org](/) homepage. Search for `homepage` in the [pegasus/mobile.yml](https://crowdin.com/translate/codeorg/56/enus-es#q=homepage) file in the Code.org project.
1. Then translate the [hourofcode.com/learn](https://hourofcode.com/learn) Hour of Code activity page.
  * Complete the [blockly-mooc/tutorialExplorer.json](https://crowdin.com/translate/codeorg/546/enus-es) file in the Code.org project.
  * Complete tutorial information by searching for `tutorial_` in the [hourofcode.com homepage file](https://crowdin.com/translate/hour-of-code/433/en-es#q=tutorial_) in the Hour of Code Project.
1. Translate the HourofCode.com homepage by completing the [hourofcode.com homepage file](https://crowdin.com/translate/hour-of-code/433/en-es#q=tutorial_) in the Hour of Code project.


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
1. blockly-mooc/bounce.json - context: [Bounce](https://studio.code.org/s/course3/lessons/15/levels/1)
1. blockly-mooc/jigsaw.json - context: [Jigsaw](https://studio.code.org/s/course1/lessons/3/levels/1)

<a name="crowdinhowto"href="#crowdinhowto"></a>
## How to Use CrowdIn

<embed src="/files/crowdin.swf" style="max-width: 100%; max-height: 550px;"/>

Watch the [demo video](/files/crowdin.swf) in full screen.

## How translations are selected

Members of the project are either a translator or proofreader. A translator can provide translations, while a proofreader can both provide translations as well as select the best translation to be used on the site.

The final translation that appears on our site is selected as follows:

1. A proofreader selects the best translation.
2. If there is no translation selected by a proofreader, translators vote on the best translation and the translation with the most votes is selected.
3. if votes are tied, the most recent translation will be selected.


 
---

### Translate Khan Academy coding tutorials to Spanish and Portuguese
Click [here](http://cs-blog.khanacademy.org/2013/10/ayuda-traducir-nuestro-curriculo-en.html) to also help Khan Academy translate their tutorials to Spanish and Portuguese.
