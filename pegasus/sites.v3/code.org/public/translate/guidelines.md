---
title: Guidelines for Translations
nav: translate_nav
theme: responsive
---

# Tips and Guidelines for Consistent Translations

### Be Gender Neutral
The target audience for drag-drop programming is individual or small groups of children, aged 8+. Please use gender-neutral forms if possible in your language.

### Spanish
In Crowdin, you will see both Spanish and Spanish, Mexico. Please translate Spanish as Spain Spanish, and translate Spanish, Mexico general enough for all LATAM countries to universally understand.

### Japanese
Since Code.org curriculum currently targets children ages 4-18, try to use Katakana or Hiragana as much as possible over Kanji characters.

### Avoid Technical Jargon
Our tutorials are meant for beginners, so please avoid technical jargon. It is **far** more important that language be clear to beginners than for it to match what experienced programmers might use. For example, Blockly uses the term "text" instead of "string", and we use "list" instead of "array". Also, Blockly uses 1-based indexing instead of the more common 0-based indexing.

### Translating course names
In most cases it would be better if the program names are translated. The few exceptions would be brands/partners like Star Wars or Minecraft. Brands that are mixed like Infinity Play Lab, can be left to your discretion. I would think to keep Infinity, but then translate Play Lab. Same for Flappy Code where Flappy from Flappy Bird may be recognizable enough that you can leave that in English and translate Code. You can translate all other course names like Play Lab, Artist, Classic Maze, Course 1, etc.

### Review The CrowdIn Glossary
Consistency is important. In English, for example, we have gone back and forth on whether to use the term "function" or "procedure". What is more important than which term is chosen is that the same term is used throughout. Inside the CrowdIn interface, click the "Terminology" tab to see what the key terms are. These are the ones that need to be translated consistently within each language.

### Untranslatable Symbols
If any mathematical (or other) symbols are inappropriate in your language but are not offered for customization, please let us know by contacting translations@code.org.

### Translate Text, Not Code
Code that shows up in peach or green like `var x = 2;`, `&quot;`, `%{keyword}` should not be translated. There is also the case when you might see text such as `{ outside text { inside text } outside text }`. Notice the two sets of curly braces. Translate the inside text, but do not translate the outside text. And for consistency, keep the same capitalization and punctuation of our strings.

### Do not translate the # sign
Usually when we use the '#' sign in the string, it is meant as a placeholder for an actual number and should be kept in the translation. For example you might see the string "# blocks" in which case the translation should be something like "# bloques" as if later on the site it could be replaced with any number like "5 bloques". The placement of the # is variable, so if it makes more sense in a different language to do "bloques #" that works too.

### Use Informal Style
The tone is informal and conversational, and we prefer short phrases to long ones, such as "if path ahead" instead of "if there is a path ahead". Translations do not need to be exact. You can use informal tone for the tutorials (since these are targeted for younger students) and formal tone for everything else.

* Pegasus/mobile.yml is for the code.org homepage, code.org/learn, and the teacher dashboard so keep it formal and targeted for adults. 
* All other pages can be casual and informal, targeted for kids ages 4-18.

### CrowdIn Etiquette
As a translator, please do not submit a translation that is identical to another user's submission. If you think a proofreader has made a mistake, please leave a comment in the comment section to bring it to their attention. As a proofreader, please do not delete translations.
