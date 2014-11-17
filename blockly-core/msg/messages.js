/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview English strings.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Msg.en');

goog.require('Blockly.Msg');


/**
 * Due to the frequency of long strings, the 80-column wrap rule need not apply
 * to message files.
 */

// Context menus.
/// context menu - Remove the descriptive comment from the selected block.
Blockly.Msg.DUPLICATE_BLOCK = 'Duplicate';
/// context menu - Change from 'inline' to 'external' mode for displaying blocks used as inputs to the selected block.
Blockly.Msg.REMOVE_COMMENT = 'Remove Comment';
/// context menu - Add a descriptive comment to the selected block.
Blockly.Msg.ADD_COMMENT = 'Add Comment';
///context menu - Change from 'external' to 'inline' mode for displaying blocks used as inputs to the selected block.
Blockly.Msg.EXTERNAL_INPUTS = 'External Inputs';
///context menu - Permanently delete the selected block.
Blockly.Msg.INLINE_INPUTS = 'Inline Inputs';
///context menu - Permanently delete the selected block.
Blockly.Msg.DELETE_BLOCK = 'Delete Block';
///context menu - Permanently delete the %1 selected blocks.\n\nParameters:\n* %1 - an integer greater than 1.
Blockly.Msg.DELETE_X_BLOCKS = 'Delete %1 Blocks';
///context menu - Make the appearance of the selected block smaller by hiding some information about it.
Blockly.Msg.COLLAPSE_BLOCK = 'Collapse Block';
///context menu - Make the appearance of the selected blocks smaller by hiding some information about it.  Use the same terminology as in the previous message.
Blockly.Msg.COLLAPSE_ALL = 'Collapse Blocks';
///context menu - Restore the appearance of the selected block by showing information about it that was hidden (collapsed) earlier.
Blockly.Msg.EXPAND_BLOCK = 'Expand Block';
///context menu - Restore the appearance of the selected block by showing information about it that was hidden (collapsed) earlier.  Use the same terminology as in the previous message.
Blockly.Msg.EXPAND_ALL = 'Expand Blocks';
///context menu - Make the selected block have no effect (unless reenabled).
Blockly.Msg.DISABLE_BLOCK = 'Disable Block';
///context menu - Make the selected block have effect (after having been disabled earlier).
Blockly.Msg.ENABLE_BLOCK = 'Enable Block';
///context menu - Provide helpful information about the selected block.
Blockly.Msg.HELP = 'Help';

// Variable/Parameter modification.
///prompt - This message is only seen in the Opera browser.  With most browsers, users can edit numeric values in blocks by just clicking and typing.  Opera does not allows this, so we have to open a new window and prompt users with this message to chanage a value.
Blockly.Msg.CHANGE_VALUE_TITLE = 'Change value:';
///dropdown choice - When the user clicks on a variable block, this is one of the dropdown menu choices.  It is used to define a new variable.  See [https://code.google.com/p/blockly/wiki/Variables#Dropdown_menu https://code.google.com/p/blockly/wiki/Variables#Dropdown_menu].
Blockly.Msg.NEW_VARIABLE = 'New variable...';
///prompt - Prompts the user to enter the name for a new variable.  See [https://code.google.com/p/blockly/wiki/Variables#Dropdown_menu https://code.google.com/p/blockly/wiki/Variables#Dropdown_menu].
Blockly.Msg.NEW_VARIABLE_TITLE = 'New variable name:';
///dropdown choice - When the user clicks on a variable block, this is one of the dropdown menu choices.  It is used to rename the current variable.  See [https://code.google.com/p/blockly/wiki/Variables#Dropdown_menu https://code.google.com/p/blockly/wiki/Variables#Dropdown_menu].
Blockly.Msg.RENAME_VARIABLE = 'Rename variable...';
///prompt - Prompts the user to enter the new name for the selected variable.  See [https://code.google.com/p/blockly/wiki/Variables#Dropdown_menu https://code.google.com/p/blockly/wiki/Variables#Dropdown_menu].\n\nParameters:\n* %1 - the name of the variable to be renamed.
Blockly.Msg.RENAME_VARIABLE_TITLE = 'Rename all "%1" variables to:';
///dropdown choice - When the user clicks on a parameter block, this is one of the dropdown menu choices.  It is used to rename the current parameter.
Blockly.Msg.RENAME_PARAMETER = 'Rename parameter...';
///prompt - Prompts the user to enter the new name for the selected parameter.
Blockly.Msg.RENAME_PARAMETER_TITLE = 'Rename all "%1" parameters to:';
///dropdown choice - When the user clicks on a parameter block, this is one of the dropdown menu choices.  It is used to delete the current parameter.
Blockly.Msg.DELETE_PARAMETER = 'Delete parameter...';
///prompt - Prompts the user to delete selected parameter and all occurrences.
Blockly.Msg.DELETE_PARAMETER_TITLE = 'This will delete all "%1" parameter occurrences. Are you sure?';

// Colour Blocks.
///url - Information about colour.
Blockly.Msg.COLOUR_PICKER_HELPURL = 'http://en.wikipedia.org/wiki/Color';
///tooltip - See [https://code.google.com/p/blockly/wiki/Colour#Picking_a_colour_from_a_palette https://code.google.com/p/blockly/wiki/Colour#Picking_a_colour_from_a_palette].
Blockly.Msg.COLOUR_PICKER_TOOLTIP = 'Choose a colour from the palette.';
///url - A link that displays a random colour each time you visit it.
Blockly.Msg.COLOUR_RANDOM_HELPURL = 'http://randomcolour.com';
///block text - Title of block that generates a colour at random.
Blockly.Msg.COLOUR_RANDOM_TITLE = 'random colour';
///tooltip - See [https://code.google.com/p/blockly/wiki/Colour#Generating_a_random_colour https://code.google.com/p/blockly/wiki/Colour#Generating_a_random_colour].
Blockly.Msg.COLOUR_RANDOM_TOOLTIP = 'Choose a colour at random.';
///url - A link for color codes with percentages (0-100%) for each component, instead of the more common 0-255, which may be more difficult for beginners.
Blockly.Msg.COLOUR_RGB_HELPURL = 'http://www.december.com/html/spec/colorper.html';
///block text - Title of block for [https://code.google.com/p/blockly/wiki/Colour#Creating_a_colour_from_red,_green,_and_blue_components https://code.google.com/p/blockly/wiki/Colour#Creating_a_colour_from_red,_green,_and_blue_components].
Blockly.Msg.COLOUR_RGB_TITLE = 'colour with';
///block input text - The amount of red (from 0 to 100) to use when [https://code.google.com/p/blockly/wiki/Colour#Creating_a_colour_from_red,_green,_and_blue_components https://code.google.com/p/blockly/wiki/Colour#Creating_a_colour_from_red,_green,_and_blue_components].
Blockly.Msg.COLOUR_RGB_RED = 'red';
///block input text - The amount of green (from 0 to 100) to use when [https://code.google.com/p/blockly/wiki/Colour#Creating_a_colour_from_red,_green,_and_blue_components https://code.google.com/p/blockly/wiki/Colour#Creating_a_colour_from_red,_green,_and_blue_components].
Blockly.Msg.COLOUR_RGB_GREEN = 'green';
///block input text - The amount of blue (from 0 to 100) to use when [https://code.google.com/p/blockly/wiki/Colour#Creating_a_colour_from_red,_green,_and_blue_components https://code.google.com/p/blockly/wiki/Colour#Creating_a_colour_from_red,_green,_and_blue_components].
Blockly.Msg.COLOUR_RGB_BLUE = 'blue';
///tooltip - See [https://code.google.com/p/blockly/wiki/Colour#Creating_a_colour_from_red,_green,_and_blue_components https://code.google.com/p/blockly/wiki/Colour#Creating_a_colour_from_red,_green,_and_blue_components].
Blockly.Msg.COLOUR_RGB_TOOLTIP = 'Create a colour with the specified amount of red, green, and blue.  All values must be between 0 and 100.';
///url - A useful link that displays blending of two colors.
Blockly.Msg.COLOUR_BLEND_HELPURL = 'http://meyerweb.com/eric/tools/color-blend/';
///block text - A verb for blending two shades of paint.
Blockly.Msg.COLOUR_BLEND_TITLE = 'blend';
///block input text - The first of two colours to [https://code.google.com/p/blockly/wiki/Colour#Blending_colours blend].
Blockly.Msg.COLOUR_BLEND_COLOUR1 = 'colour 1';
///block input text - The second of two colours to [https://code.google.com/p/blockly/wiki/Colour#Blending_colours blend].
Blockly.Msg.COLOUR_BLEND_COLOUR2 = 'colour 2';
///block input text - The proportion of the [https://code.google.com/p/blockly/wiki/Colour#Blending_colours blend] containing the first color; the remaining proportion is of the second colour.  For example, if the first colour is red and the second color blue, a ratio of 1 would yield pure red, a ratio of .5 would yield purple (equal amounts of red and blue), and a ratio of 0 would yield pure blue.
Blockly.Msg.COLOUR_BLEND_RATIO = 'ratio';
///tooltip - See [https://code.google.com/p/blockly/wiki/Colour#Blending_colours https://code.google.com/p/blockly/wiki/Colour#Blending_colours].
Blockly.Msg.COLOUR_BLEND_TOOLTIP = 'Blends two colours together with a given ratio (0.0 - 1.0).';

// Loop Blocks.
///url - Describes 'repeat loops' in computer programs; consider using the translation of the page [http://en.wikipedia.org/wiki/Control_flow http://en.wikipedia.org/wiki/Control_flow].
Blockly.Msg.CONTROLS_REPEAT_HELPURL = 'http://en.wikipedia.org/wiki/For_loop';
///block text - Title of [https://code.google.com/p/blockly/wiki/Loops#repeat repeat block].
Blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT = 'repeat';
///block text - Text following the number of times a [https://code.google.com/p/blockly/wiki/Loops#repeat repeat loop] should be repeated.
Blockly.Msg.CONTROLS_REPEAT_TITLE_TIMES = 'times';
///block text - Preceding the blocks in the body of the loop.  See [https://code.google.com/p/blockly/wiki/Loops https://code.google.com/p/blockly/wiki/Loops].
Blockly.Msg.CONTROLS_REPEAT_INPUT_DO = 'do';
///tooltip - See [https://code.google.com/p/blockly/wiki/Loops#repeat https://code.google.com/p/blockly/wiki/Loops#repeat].
Blockly.Msg.CONTROLS_REPEAT_TOOLTIP = 'Do some statements several times.';
///url - Describes 'while loops' in computer programs; consider using the translation of [http://en.wikipedia.org/wiki/While_loop http://en.wikipedia.org/wiki/While_loop], if present, or [http://en.wikipedia.org/wiki/Control_flow http://en.wikipedia.org/wiki/Control_flow].
Blockly.Msg.CONTROLS_WHILEUNTIL_HELPURL = 'http://code.google.com/p/blockly/wiki/Repeat';
Blockly.Msg.CONTROLS_WHILEUNTIL_INPUT_DO = Blockly.Msg.CONTROLS_REPEAT_INPUT_DO;
///dropdown - Specifies that a loop should [https://code.google.com/p/blockly/wiki/Loops#Repeat_while repeat while] the following condition is true.
Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_WHILE = 'repeat while';
///dropdown - Specifies that a loop should [https://code.google.com/p/blockly/wiki/Loops#Repeat_until repeat until] the following condition becomes true.
Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_UNTIL = 'repeat until';
///tooltip - See [https://code.google.com/p/blockly/wiki/Loops#repeat_while Loops#repeat_while https://code.google.com/p/blockly/wiki/Loops#repeat_while Loops#repeat_while].
Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_WHILE = 'While a value is true, then do some statements.';
///tooltip - See [https://code.google.com/p/blockly/wiki/Loops#repeat_until https://code.google.com/p/blockly/wiki/Loops#repeat_until].
Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL = 'While a value is false, then do some statements.';

///url - Describes 'for loops' in computer programs.  Consider using your language's translation of [http://en.wikipedia.org/wiki/For_loop http://en.wikipedia.org/wiki/For_loop], if present.
Blockly.Msg.CONTROLS_FOR_HELPURL = 'https://code.google.com/p/blockly/wiki/Loops#count_with';
///tooltip - See [https://code.google.com/p/blockly/wiki/Loops#count_with https://code.google.com/p/blockly/wiki/Loops#count_with].\n\nParameters:\n* %1 - the name of the loop variable.
Blockly.Msg.CONTROLS_FOR_TOOLTIP = 'Have the variable %1 take on the values from the start number to the end number, counting by the specified interval, and do the specified blocks.';
///block title - Title of [https://code.google.com/p/blockly/wiki/Loops#count_with count with] blocks.
Blockly.Msg.CONTROLS_FOR_INPUT_WITH = 'count with';
///variable name - The default name for a [https://code.google.com/p/blockly/wiki/Loops#count_with count with] loop variable.  You can use a word or symbol in algebra for an unknown value or a word meaning 'counter'.
Blockly.Msg.CONTROLS_FOR_INPUT_VAR = 'x';
///block input text - Text preceding the first (and usually lower) number in a range, as in [https://code.google.com/p/blockly/wiki/Loops#count_with https://code.google.com/p/blockly/wiki/Loops#count_with].
Blockly.Msg.CONTROLS_FOR_INPUT_FROM = 'from';
///block input text - Text preceding the second (and usually higher) number in a range, as in [https://code.google.com/p/blockly/wiki/Loops#count_with https://code.google.com/p/blockly/wiki/Loops#count_with].
Blockly.Msg.CONTROLS_FOR_INPUT_TO = 'to';
///block input text - Text preceding the increment amount in a range, as in [https://code.google.com/p/blockly/wiki/Loops#count_with https://code.google.com/p/blockly/wiki/Loops#count_with].
Blockly.Msg.CONTROLS_FOR_INPUT_BY = 'by';
Blockly.Msg.CONTROLS_FOR_INPUT_DO = Blockly.Msg.CONTROLS_REPEAT_INPUT_DO;
///block text - Text following the increment amount of the range.  This is the empty string in most languages.
Blockly.Msg.CONTROLS_FOR_TAIL = '';

///url - Describes 'for-each loops' in computer programs.  Consider using your language's translation of [http://en.wikipedia.org/wiki/Foreach http://en.wikipedia.org/wiki/Foreach] if present.
Blockly.Msg.CONTROLS_FOREACH_HELPURL = 'https://code.google.com/p/blockly/wiki/Loops#for_each for each block';
///block text - Title of [https://code.google.com/p/blockly/wiki/Loops#for_each for each block].
Blockly.Msg.CONTROLS_FOREACH_INPUT_ITEM = 'for each item';
Blockly.Msg.CONTROLS_FOREACH_INPUT_VAR = Blockly.Msg.CONTROLS_FOR_INPUT_VAR;
///block text - Preceding the list that should be iterated over in a [https://code.google.com/p/blockly/wiki/Loops#for_each for each loop].
Blockly.Msg.CONTROLS_FOREACH_INPUT_INLIST = 'in list';
///block text - Following the list that should be iterated over in a [https://code.google.com/p/blockly/wiki/Loops#for_each for each loop].  This is empty in most, but not all, languages.
Blockly.Msg.CONTROLS_FOREACH_INPUT_INLIST_TAIL = '';
Blockly.Msg.CONTROLS_FOREACH_INPUT_DO = Blockly.Msg.CONTROLS_REPEAT_INPUT_DO;
///block text - Description of [https://code.google.com/p/blockly/wiki/Loops#for_each for each blocks].\n\nParameters:\n* %1 - the name of the loop variable.
Blockly.Msg.CONTROLS_FOREACH_TOOLTIP = 'For each item in a list, set the variable "%1" to the item, and then do some statements.';

///url - Describes control flow in computer programs.  Consider using your language's translation of [http://en.wikipedia.org/wiki/Control_flow http://en.wikipedia.org/wiki/Control_flow], if it exists.
Blockly.Msg.CONTROLS_FLOW_STATEMENTS_HELPURL = 'https://code.google.com/p/blockly/wiki/Loops#Loop_Termination_Blocks';
///dropdown - The current loop should be exited.  See [https://code.google.com/p/blockly/wiki/Loops#break https://code.google.com/p/blockly/wiki/Loops#break].
Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK = 'break out of loop';
///dropdown - The current iteration of the loop should be ended and the next should begin.  See [https://code.google.com/p/blockly/wiki/Loops#continue_with_next_iteration https://code.google.com/p/blockly/wiki/Loops#continue_with_next_iteration].
Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE = 'continue with next iteration of loop';
///tooltip - See [https://code.google.com/p/blockly/wiki/Loops#break_out_of_loop https://code.google.com/p/blockly/wiki/Loops#break_out_of_loop].
Blockly.Msg.CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK = 'Break out of the containing loop.';
///tooltip - See [https://code.google.com/p/blockly/wiki/Loops#continue_with_next_iteration https://code.google.com/p/blockly/wiki/Loops#continue_with_next_iteration].
Blockly.Msg.CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE = 'Skip the rest of this loop, and continue with the next iteration.';
///warning - The user has tried placing a block outside of a loop (for each, while, repeat, etc.), but this type of block may only be used within a loop.  See [https://code.google.com/p/blockly/wiki/Loops#Loop_Termination_Blocks https://code.google.com/p/blockly/wiki/Loops#Loop_Termination_Blocks].
Blockly.Msg.CONTROLS_FLOW_STATEMENTS_WARNING = 'Warning: This block may only be used within a loop.';

// Logic Blocks.
///url - Describes conditional statements (if-then-else) in computer programs.  Consider using your language's translation of [http://en.wikipedia.org/wiki/If_else http://en.wikipedia.org/wiki/If_else], if present.
Blockly.Msg.CONTROLS_IF_HELPURL = 'http://code.google.com/p/blockly/wiki/If_Then';
///tooltip - Describes [https://code.google.com/p/blockly/wiki/IfElse#If_blocks 'if' blocks].  Consider using your language's translation of [http://en.wikipedia.org/wiki/If_statement http://en.wikipedia.org/wiki/If_statement], if present.
Blockly.Msg.CONTROLS_IF_TOOLTIP_1 = 'If a value is true, then do some statements.';
///tooltip - Describes [https://code.google.com/p/blockly/wiki/IfElse#If-Else_blocks if-else blocks].  Consider using your language's translation of [http://en.wikipedia.org/wiki/If_statement http://en.wikipedia.org/wiki/If_statement], if present.
Blockly.Msg.CONTROLS_IF_TOOLTIP_2 = 'If a value is true, then do the first block of statements.  Otherwise, do the second block of statements.';
///tooltip - Describes [https://code.google.com/p/blockly/wiki/IfElse#If-Else-If_blocks if-else-if blocks].  Consider using your language's translation of [http://en.wikipedia.org/wiki/If_statement http://en.wikipedia.org/wiki/If_statement], if present.
Blockly.Msg.CONTROLS_IF_TOOLTIP_3 = 'If the first value is true, then do the first block of statements.  Otherwise, if the second value is true, do the second block of statements.';
///tooltip - Describes [https://code.google.com/p/blockly/wiki/IfElse#If-Else-If-Else_blocks if-else-if-else blocks].  Consider using your language's translation of [http://en.wikipedia.org/wiki/If_statement http://en.wikipedia.org/wiki/If_statement], if present.
Blockly.Msg.CONTROLS_IF_TOOLTIP_4 = 'If the first value is true, then do the first block of statements.  Otherwise, if the second value is true, do the second block of statements.  If none of the values are true, do the last block of statements.';
///block text - See [https://code.google.com/p/blockly/wiki/IfElse https://code.google.com/p/blockly/wiki/IfElse].
///It is recommended, but not essential, that this have text in common with the translation of 'else if'
Blockly.Msg.CONTROLS_IF_MSG_IF = 'if';
///block text - See [https://code.google.com/p/blockly/wiki/IfElse https://code.google.com/p/blockly/wiki/IfElse].  The English words "otherwise if" would probably be clearer than "else if", but the latter is used because it is traditional and shorter.
Blockly.Msg.CONTROLS_IF_MSG_ELSEIF = 'else if';
///block text - See [https://code.google.com/p/blockly/wiki/IfElse https://code.google.com/p/blockly/wiki/IfElse].  The English word "otherwise" would probably be superior to "else", but the latter is used because it is traditional and shorter.
Blockly.Msg.CONTROLS_IF_MSG_ELSE = 'else';
Blockly.Msg.CONTROLS_IF_MSG_THEN = Blockly.Msg.CONTROLS_REPEAT_INPUT_DO;
Blockly.Msg.CONTROLS_IF_IF_TITLE_IF = Blockly.Msg.CONTROLS_IF_MSG_IF;
///tooltip - Describes [https://code.google.com/p/blockly/wiki/IfElse#Block_Modification if block modification].
Blockly.Msg.CONTROLS_IF_IF_TOOLTIP = 'Add, remove, or reorder sections to reconfigure this if block.';
Blockly.Msg.CONTROLS_IF_ELSEIF_TITLE_ELSEIF = Blockly.Msg.CONTROLS_IF_MSG_ELSEIF;
///tooltip - Describes the 'else if' subblock during [https://code.google.com/p/blockly/wiki/IfElse#Block_Modification if block modification].
Blockly.Msg.CONTROLS_IF_ELSEIF_TOOLTIP = 'Add a condition to the if block.';
Blockly.Msg.CONTROLS_IF_ELSE_TITLE_ELSE = Blockly.Msg.CONTROLS_IF_MSG_ELSE;
///tooltip - Describes the 'else' subblock during [https://code.google.com/p/blockly/wiki/IfElse#Block_Modification if block modification].
Blockly.Msg.CONTROLS_IF_ELSE_TOOLTIP = 'Add a final, catch-all condition to the if block.';

///url - Information about comparisons.
Blockly.Msg.LOGIC_COMPARE_HELPURL = 'http://en.wikipedia.org/wiki/Inequality_(mathematics)';
///tooltip - Describes the equals (=) block.
Blockly.Msg.LOGIC_COMPARE_TOOLTIP_EQ = 'Return true if both inputs equal each other.';
///tooltip - Describes the equals (&ne;) block.
Blockly.Msg.LOGIC_COMPARE_TOOLTIP_NEQ = 'Return true if both inputs are not equal to each other.';
///tooltip - Describes the equals (&lt;) block.
Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LT = 'Return true if the first input is smaller than the second input.';
///tooltip - Describes the equals (&le;) block.
Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LTE = 'Return true if the first input is smaller than or equal to the second input.';
///tooltip - Describes the equals (&gt;) block.
Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GT = 'Return true if the first input is greater than the second input.';
///tooltip - Describes the equals (&ge;) block.
Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GTE = 'Return true if the first input is greater than or equal to the second input.';

///url - Information about the Boolean conjunction ("and") and disjunction ("or") operators.  Consider using the translation of [http://en.wikipedia.org/wiki/Boolean_logic http://en.wikipedia.org/wiki/Boolean_logic], if it exists in your language.
Blockly.Msg.LOGIC_OPERATION_HELPURL = 'http://code.google.com/p/blockly/wiki/And_Or';
///tooltip - See [http://en.wikipedia.org/wiki/Logical_conjunction http://en.wikipedia.org/wiki/Logical_conjunction].
Blockly.Msg.LOGIC_OPERATION_TOOLTIP_AND = 'Return true if both inputs are true.';
///block text - See [http://en.wikipedia.org/wiki/Logical_conjunction http://en.wikipedia.org/wiki/Logical_conjunction].
Blockly.Msg.LOGIC_OPERATION_AND = 'and';
///block text - See [http://en.wikipedia.org/wiki/Disjunction http://en.wikipedia.org/wiki/Disjunction].
Blockly.Msg.LOGIC_OPERATION_TOOLTIP_OR = 'Return true if at least one of the inputs is true.';
///block text - See [http://en.wikipedia.org/wiki/Disjunction http://en.wikipedia.org/wiki/Disjunction].
Blockly.Msg.LOGIC_OPERATION_OR = 'or';

///url - Information about logical negation.  The translation of [http://en.wikipedia.org/wiki/Logical_negation http://en.wikipedia.org/wiki/Logical_negation] is recommended if it exists in the target language.
Blockly.Msg.LOGIC_NEGATE_HELPURL = 'http://code.google.com/p/blockly/wiki/Not';
///block text - word for logical  "not" - this is a unary operator that returns ''false'' when the input is ''true'', and ''true'' when the input is ''false''.
Blockly.Msg.LOGIC_NEGATE_INPUT_NOT = 'not';
///tooltip - See [http://en.wikipedia.org/wiki/Logical_negation http://en.wikipedia.org/wiki/Logical_negation].
Blockly.Msg.LOGIC_NEGATE_TOOLTIP = 'Returns true if the input is false.  Returns false if the input is true.';

///url - Information about the logic values ''true'' and ''false''.  Consider using the translation of [http://en.wikipedia.org/wiki/Truth_value http://en.wikipedia.org/wiki/Truth_value] if it exists in your language.
Blockly.Msg.LOGIC_BOOLEAN_HELPURL = 'http://code.google.com/p/blockly/wiki/True_False';
///block text - The word for the [http://en.wikipedia.org/wiki/Truth_value logical value] ''true''.
Blockly.Msg.LOGIC_BOOLEAN_TRUE = 'true';
///block text - The word for the [http://en.wikipedia.org/wiki/Truth_value logical value] ''false''.
Blockly.Msg.LOGIC_BOOLEAN_FALSE = 'false';
///tooltip - Indicates that the block returns either of the two possible [http://en.wikipedia.org/wiki/Truth_value logical values].
Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP = 'Returns either true or false.';

///url - Provide a link to the translation of [http://en.wikipedia.org/wiki/Nullable_type http://en.wikipedia.org/wiki/Nullable_type], if it exists in your language; otherwise, do not worry about translating this advanced concept.
Blockly.Msg.LOGIC_NULL_HELPURL = 'http://en.wikipedia.org/wiki/Nullable_type';
///block text - In computer languages, ''null'' is a special value that indicates that no value has been set.  You may use your language's word for "nothing" or "invalid".
Blockly.Msg.LOGIC_NULL = 'null';
///tooltip - This should use the word from the previous message.
Blockly.Msg.LOGIC_NULL_TOOLTIP = 'Returns null.';

///url - Describes the programming language operator known as the ''ternary'' or ''conditional'' operator.  It is recommended that you use the translation of [http://en.wikipedia.org/wiki/%3F: http://en.wikipedia.org/wiki/%3F:] if it exists.
Blockly.Msg.LOGIC_TERNARY_HELPURL = 'http://en.wikipedia.org/wiki/%3F:';
///block input text - Label for the input whose value determines which of the other two inputs is returned.  In some programming languages, this is called a ''''predicate''''.
Blockly.Msg.LOGIC_TERNARY_CONDITION = 'test';
///block input text - Indicates that the following input should be returned (used as output) if the test input is true.  Remember to try to keep block text terse (short).
Blockly.Msg.LOGIC_TERNARY_IF_TRUE = 'if true';
///block input text - Indicates that the following input should be returned (used as output) if the test input is false.
Blockly.Msg.LOGIC_TERNARY_IF_FALSE = 'if false';
///tooltip - See [http://en.wikipedia.org/wiki/%3F: http://en.wikipedia.org/wiki/%3F:].
Blockly.Msg.LOGIC_TERNARY_TOOLTIP = 'Check the condition in "test". If the condition is true, returns the "if true" value; otherwise returns the "if false" value.';

// Math Blocks.
///url - Information about (real) numbers.
Blockly.Msg.MATH_NUMBER_HELPURL = 'http://en.wikipedia.org/wiki/Number';
///tooltip - Any positive or negative number, not necessarily an integer.
Blockly.Msg.MATH_NUMBER_TOOLTIP = 'A number.';

///url - Information about addition, subtraction, multiplication, division, and exponentiation.
Blockly.Msg.MATH_ARITHMETIC_HELPURL = 'http://en.wikipedia.org/wiki/Arithmetic';
///tooltip - See [http://en.wikipedia.org/wiki/Addition http://en.wikipedia.org/wiki/Addition].
Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_ADD = 'Return the sum of the two numbers.';
///tooltip - See [http://en.wikipedia.org/wiki/Subtraction http://en.wikipedia.org/wiki/Subtraction].
Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MINUS = 'Return the difference of the two numbers.';
///tooltip - See [http://en.wikipedia.org/wiki/Multiplication http://en.wikipedia.org/wiki/Multiplication].
Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MULTIPLY = 'Return the product of the two numbers.';
///tooltip - See [http://en.wikipedia.org/wiki/Division_(mathematics) http://en.wikipedia.org/wiki/Division_(mathematics)].
Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_DIVIDE = 'Return the quotient of the two numbers.';
///tooltip - See [http://en.wikipedia.org/wiki/Exponentiation http://en.wikipedia.org/wiki/Exponentiation].
Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_POWER = 'Return the first number raised to the power of the second number.';

///url - Information about the square root operation.
Blockly.Msg.MATH_SINGLE_HELPURL = 'http://en.wikipedia.org/wiki/Square_root';
///dropdown - This computes the positive [http://en.wikipedia.org/wiki/Square_root square root] of its input.  For example, the square root of 16 is 4.
Blockly.Msg.MATH_SINGLE_OP_ROOT = 'square root';
///tooltip - Please use the same term as in the previous message.
Blockly.Msg.MATH_SINGLE_TOOLTIP_ROOT = 'Return the square root of a number.';
///dropdown - This leaves positive numeric inputs changed and inverts negative inputs.  For example, the absolute value of 5 is 5; the absolute value of -5 is also 5.  For more information, see [http://en.wikipedia.org/wiki/Absolute_value http://en.wikipedia.org/wiki/Absolute_value].
Blockly.Msg.MATH_SINGLE_OP_ABSOLUTE = 'absolute';
///tooltip - Please use the same term as in the previous message.
Blockly.Msg.MATH_SINGLE_TOOLTIP_ABS = 'Return the absolute value of a number.';

///tooltip - Calculates '''0-n''', where '''n''' is the single numeric input.
Blockly.Msg.MATH_SINGLE_TOOLTIP_NEG = 'Return the negation of a number.';
///tooltip - Calculates the [http://en.wikipedia.org/wiki/Natural_logarithm|natural logarithm] of its single numeric input.
Blockly.Msg.MATH_SINGLE_TOOLTIP_LN = 'Return the natural logarithm of a number.';
///tooltip - Calculates the [http://en.wikipedia.org/wiki/Common_logarithm common logarithm] of its single numeric input.
Blockly.Msg.MATH_SINGLE_TOOLTIP_LOG10 = 'Return the base 10 logarithm of a number.';
///tooltip - Multiplies [http://en.wikipedia.org/wiki/E_%28mathematical_constant%29 e] by itself n times, where n is the single numeric input.
Blockly.Msg.MATH_SINGLE_TOOLTIP_EXP = 'Return e to the power of a number.';
///tooltip - Multiplies 10 by itself n times, where n is the single numeric input.
Blockly.Msg.MATH_SINGLE_TOOLTIP_POW10 = 'Return 10 to the power of a number.';

///url - Information about the trigonometric functions sine, cosine, tangent, and their inverses (ideally using degrees, not radians).
Blockly.Msg.MATH_TRIG_HELPURL = 'http://en.wikipedia.org/wiki/Trigonometric_functions';
///tooltip - For more information, see [http://en.wikipedia.org/wiki/Trigonometric_functions#Sine.2C_cosine_and_tangent http://en.wikipedia.org/wiki/Trigonometric_functions] and [http://en.wikipedia.org/wiki/Degree_(angle) http://en.wikipedia.org/wiki/Degree_(angle)].
Blockly.Msg.MATH_TRIG_TOOLTIP_SIN = 'Return the sine of a degree (not radian).';
///tooltip - For more information, see [http://en.wikipedia.org/wiki/Trigonometric_functions#Sine.2C_cosine_and_tangent http://en.wikipedia.org/wiki/Trigonometric_functions#Sine.2C_cosine_and_tangent] and [http://en.wikipedia.org/wiki/Degree_(angle) http://en.wikipedia.org/wiki/Degree_(angle)].
Blockly.Msg.MATH_TRIG_TOOLTIP_COS = 'Return the cosine of a degree (not radian).';
///tooltip - For more information, see [http://en.wikipedia.org/wiki/Trigonometric_functions#Sine.2C_cosine_and_tangent http://en.wikipedia.org/wiki/Trigonometric_functions#Sine.2C_cosine_and_tangent]  and [http://en.wikipedia.org/wiki/Degree_(angle) http://en.wikipedia.org/wiki/Degree_(angle)].
Blockly.Msg.MATH_TRIG_TOOLTIP_TAN = 'Return the tangent of a degree (not radian).';
///tooltip - The [http://en.wikipedia.org/wiki/Inverse_trigonometric_functions inverse] of the [http://en.wikipedia.org/wiki/Cosine#Sine.2C_cosine_and_tangent cotangent function, using [http://en.wikipedia.org/wiki/Degree_(angle) degrees], not radians.
Blockly.Msg.MATH_TRIG_TOOLTIP_ASIN = 'Return the arcsine of a number.';
///tooltip - The [http://en.wikipedia.org/wiki/Inverse_trigonometric_functions inverse] of the [http://en.wikipedia.org/wiki/Cosine#Sine.2C_cosine_and_tangent cosine] function, using [http://en.wikipedia.org/wiki/Degree_(angle) degrees], not radians.
Blockly.Msg.MATH_TRIG_TOOLTIP_ACOS = 'Return the arccosine of a number.';
///tooltip - The [http://en.wikipedia.org/wiki/Inverse_trigonometric_functions inverse] of the [http://en.wikipedia.org/wiki/Cosine#Sine.2C_cosine_and_tangent tangent] function, using [http://en.wikipedia.org/wiki/Degree_(angle)|degrees], not radians.
Blockly.Msg.MATH_TRIG_TOOLTIP_ATAN = 'Return the arctangent of a number.';

///url - Information about the mathematical constants &pi;, e, the golden ratio (&phi;), &radic; 2, &radic 1/2, and infinity (&infin;).
Blockly.Msg.MATH_CONSTANT_HELPURL = 'http://en.wikipedia.org/wiki/Mathematical_constant';
///tooltip - Provides the specified [http://en.wikipedia.org/wiki/Mathematical_constant mathematical constant].
Blockly.Msg.MATH_CONSTANT_TOOLTIP = 'Return one of the common constants: \u03c0 (3.141\u2026), e (2.718\u2026), \u03c6 (1.618\u2026), sqrt(2) (1.414\u2026), sqrt(\u00bd) (0.707\u2026), or \u221e (infinity).';
///dropdown - A number is even if it is a multiple of 2.  For example, 4 is even (yielding true), but 3 is not (false).
Blockly.Msg.MATH_IS_EVEN = 'is even';
///dropdown - A number is odd if it is not a multiple of 2.  For example, 3 is odd (yielding true), but 4 is not (false).  The opposite of ''''odd'''' is ''''even''''.
Blockly.Msg.MATH_IS_ODD = 'is odd';
///dropdown - A number is prime if it cannot be evenly divided by any positive integers except for 1 and itself.  For example, 5 is prime, but 6 is not because 2 &times; 3 = 6.
Blockly.Msg.MATH_IS_PRIME = 'is prime';
///dropdown - A number is whole if it is an integer.  For example, 5 is whole, but 5.1 is not.
Blockly.Msg.MATH_IS_WHOLE = 'is whole';
///dropdown - A number is positive if it is greater than 0.  (0 is neither negative nor positive.)
Blockly.Msg.MATH_IS_POSITIVE = 'is positive';
///dropdown - A number is negative if it is less than 0.  (0 is neither negative nor positive.)
Blockly.Msg.MATH_IS_NEGATIVE = 'is negative';
///dropdown - A number x is divisible by y if y goes into x evenly.  For example, 10 is divisible by 5, but 10 is not divisible by 3.
Blockly.Msg.MATH_IS_DIVISIBLE_BY = 'is divisible by';
///tooltip - This block lets the user specify via a dropdown menu whether to check if the numeric input is even, odd, prime, whole, positive, negative, or divisible by a given value.
Blockly.Msg.MATH_IS_TOOLTIP = 'Check if a number is an even, odd, prime, whole, positive, negative, or if it is divisible by certain number.  Returns true or false.';

///url - Information about incrementing (increasing the value of) a variable.
Blockly.Msg.MATH_CHANGE_HELPURL = 'http://en.wikipedia.org/wiki/Programming_idiom#Incrementing_a_counter';
/// - As in: '''change''' [the value of variable] ''item by'' 1 (e.g., if the variable named 'item' had the value 5, change it to 6).
Blockly.Msg.MATH_CHANGE_TITLE_CHANGE = 'change';
/// - As in: ''change'' [the value of variable] '''item''' ''by'' 1 (e.g., if the variable named 'item' had the value 5, change it to 6).
Blockly.Msg.MATH_CHANGE_TITLE_ITEM = 'item';
/// - As in: ''change'' [the value of variable] ''item'' '''by''' 1 (e.g., if the variable named 'item' had the value 5, change it to 6).
Blockly.Msg.MATH_CHANGE_INPUT_BY = 'by';
///tooltip - This updates the value of the variable by adding to it the following numeric input.\n\nParameters:\n* %1 - the name of the variable whose value should be increased.
Blockly.Msg.MATH_CHANGE_TOOLTIP = 'Add a number to variable "%1".'

///url - Information about how numbers are rounded to the nearest integer
Blockly.Msg.MATH_ROUND_HELPURL = 'http://en.wikipedia.org/wiki/Rounding';
///tooltip - See [http://en.wikipedia.org/wiki/Rounding http://en.wikipedia.org/wiki/Rounding].
Blockly.Msg.MATH_ROUND_TOOLTIP = 'Round a number up or down.';
///dropdown - This rounds its input to the nearest whole number.  For example, 3.4 is rounded to 3.
Blockly.Msg.MATH_ROUND_OPERATOR_ROUND = 'round';
///dropdown - This rounds its input down to the nearest whole number.  For example, if the input was 2.2, the result would be 3.
Blockly.Msg.MATH_ROUND_OPERATOR_ROUNDUP = 'round up';
///dropdown - This rounds its input down to the nearest whole number.  For example, if the input was 3.8, the result would be 3.
Blockly.Msg.MATH_ROUND_OPERATOR_ROUNDDOWN = 'round down';

///url - Information about applying a function to a list of numbers.  (We were unable to find such information in English.  Feel free to skip this and any other URLs that are difficult.)
Blockly.Msg.MATH_ONLIST_HELPURL = '';
///dropdown - This computes the sum of the numeric elements in the list.  For example, the sum of the list {1, 4} is 5.
Blockly.Msg.MATH_ONLIST_OPERATOR_SUM = 'sum of list';
///tooltip - Please use the same term for "sum" as in the previous message.
Blockly.Msg.MATH_ONLIST_TOOLTIP_SUM = 'Return the sum of all the numbers in the list.';
///dropdown - This finds the smallest (minimum) number in a list.  For example, the smallest number in the list [-5, 0, 3] is -5.
Blockly.Msg.MATH_ONLIST_OPERATOR_MIN = 'min of list';
///tooltip - Please use the same term for "min" or "minimum" as in the previous message.
Blockly.Msg.MATH_ONLIST_TOOLTIP_MIN = 'Return the smallest number in the list.';
///dropdown - This finds the largest (maximum) number in a list.  For example, the largest number in the list [-5, 0, 3] is 3.
Blockly.Msg.MATH_ONLIST_OPERATOR_MAX = 'max of list';
///tooltip -
Blockly.Msg.MATH_ONLIST_TOOLTIP_MAX = 'Return the largest number in the list.';
///dropdown - This adds up all of the numbers in a list and divides the sum by the number of elements in the list.  For example, the [http://en.wikipedia.org/wiki/Arithmetic_mean average] of the list [1, 2, 3, 4] is 2.5 (10/4).
Blockly.Msg.MATH_ONLIST_OPERATOR_AVERAGE = 'average of list';
///tooltip - See [http://en.wikipedia.org/wiki/Arithmetic_mean].
Blockly.Msg.MATH_ONLIST_TOOLTIP_AVERAGE = 'Return the average (arithmetic mean) of the numeric values in the list.';
///dropdown - This finds the [http://en.wikipedia.org/wiki/Median median] of the numeric values in a list.  For example, the median of the list {1, 2, 7, 12, 13} is 7.
Blockly.Msg.MATH_ONLIST_OPERATOR_MEDIAN = 'median of list';
///tooltip - See [http://en.wikipedia.org/wiki/Median median].
Blockly.Msg.MATH_ONLIST_TOOLTIP_MEDIAN = 'Return the median number in the list.';
///dropdown - This finds the most common numbers ([http://en.wikipedia.org/wiki/Mode_(statistics) modes]) in a list.  For example, the modes of the list {1, 3, 9, 3, 9}  are {1, 9}.
Blockly.Msg.MATH_ONLIST_OPERATOR_MODE = 'modes of list';
///tooltip - See [http://en.wikipedia.org/wiki/Mode_(statistics) http://en.wikipedia.org/wiki/Mode_(statistics)].
Blockly.Msg.MATH_ONLIST_TOOLTIP_MODE = 'Return a list of the most common item(s) in the list.';
///dropdown - This finds the [http://en.wikipedia.org/wiki/Standard_deviation standard deviation] of the numeric values in a list.
Blockly.Msg.MATH_ONLIST_OPERATOR_STD_DEV = 'standard deviation of list';
///tooltip - See [http://en.wikipedia.org/wiki/Standard_deviation].
Blockly.Msg.MATH_ONLIST_TOOLTIP_STD_DEV = 'Return the standard deviation of the list.';
///dropdown - This choose an element at random from a list.  Each element is chosen with equal probability.
Blockly.Msg.MATH_ONLIST_OPERATOR_RANDOM = 'random item of list';
///tooltip - Please use same term for 'random' as in previous entry.
Blockly.Msg.MATH_ONLIST_TOOLTIP_RANDOM = 'Return a random element from the list.';

///url - information about the modulo (remainder) operation.
Blockly.Msg.MATH_MODULO_HELPURL = 'http://en.wikipedia.org/wiki/Modulo_operation';
///block text - This provides the remainder when dividing the first numerical input by the second.  For example, the remainder of 10 divided by 3 is 1.
Blockly.Msg.MATH_MODULO_INPUT_DIVIDEND = 'remainder of';
///tooltip - For example, the remainder of 10 divided by 3 is 1.
Blockly.Msg.MATH_MODULO_TOOLTIP = 'Return the remainder from dividing the two numbers.';

///url - Information about constraining a numeric value to be in a specific range.  (The English URL is not ideal.  Recall that translating URLs is the lowest priority.)
Blockly.Msg.MATH_CONSTRAIN_HELPURL = 'http://en.wikipedia.org/wiki/Clamping_%28graphics%29';
///block text - The title of the block that '''constrain'''s (forces) a number to be in a given range.  For example, if the number 150 is constrained to be between 5 and 100, the result will be 100.
Blockly.Msg.MATH_CONSTRAIN_INPUT_CONSTRAIN = 'constrain';
/// block input text - The text before the number at the bottom of the range in which a number should be constrained, for example, if the number 150 is constrained to be between 5 and 100, the result will be 100, and 5 would be the ''low'' input.
Blockly.Msg.MATH_CONSTRAIN_INPUT_LOW = 'low';
/// block input text - The text before the number at the top of the range in which a number should be constrained, for example, if the number 2 is constrained to be between 5 and 100, the result will be 5, and 100 would be the ''high'' input.
Blockly.Msg.MATH_CONSTRAIN_INPUT_HIGH = 'high';
///tooltip - This compares a number x to a low value L and a high value H.  If x is less then L, the result is L.  If x is greater than H, the result is H.  Otherwise, the result is x.
Blockly.Msg.MATH_CONSTRAIN_TOOLTIP = 'Constrain a number to be between the specified limits (inclusive).';

///url - Information about how computers generate random numbers.
Blockly.Msg.MATH_RANDOM_INT_HELPURL = 'http://en.wikipedia.org/wiki/Random_number_generation';
///block text - The title of the block that generates a random integer (whole number) in the specified range.  For example, if the range is from 5 to 7, this returns 5, 6, or 7 with equal likelihood
Blockly.Msg.MATH_RANDOM_INT_INPUT_FROM = 'random integer from';
Blockly.Msg.MATH_RANDOM_INT_INPUT_TO = Blockly.Msg.CONTROLS_FOR_INPUT_TO = 'to';
///tooltip - Return a random integer between two values specified as inputs.  For example, if one input was 7 and another 9, any of the numbers 7, 8, or 9 could be output.
Blockly.Msg.MATH_RANDOM_INT_TOOLTIP = 'Return a random integer between the two specified limits, inclusive.';

///url - Information about how computers generate random numbers (specifically, numbers in the range from 0 to just below 1).
Blockly.Msg.MATH_RANDOM_FLOAT_HELPURL = 'http://en.wikipedia.org/wiki/Random_number_generation';
///block text - The title of the block that generates a random number greater than or equal to 0 and less than 1.
Blockly.Msg.MATH_RANDOM_FLOAT_TITLE_RANDOM = 'random fraction';
///tooltip - Return a random integer between two values specified as inputs.  For example, if one input was 7 and another 9, any of the numbers 7, 8, or 9 could be output.
Blockly.Msg.MATH_RANDOM_FLOAT_TOOLTIP = 'Return a random fraction between 0.0 (inclusive) and 1.0 (exclusive).';

// Text Blocks.
///url - Information about how computers represent text (sometimes referred to as ''string''s).
Blockly.Msg.TEXT_TEXT_HELPURL = 'http://en.wikipedia.org/wiki/String_(computer_science)';
///tooltip - See [https://code.google.com/p/blockly/wiki/Text#Introduction https://code.google.com/p/blockly/wiki/Text#Introduction].
Blockly.Msg.TEXT_TEXT_TOOLTIP = 'A letter, word, or line of text.';

///url - Information on concatenating/appending pieces of text.
Blockly.Msg.TEXT_JOIN_HELPURL = '';
///block text - See [https://code.google.com/p/blockly/wiki/Text#Text_creation https://code.google.com/p/blockly/wiki/Text#Text_creation].
Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH = 'create text with';
///tooltip - See [https://code.google.com/p/blockly/wiki/Text#Text_creation create text with].
Blockly.Msg.TEXT_JOIN_TOOLTIP = 'Create a piece of text by joining together any number of items.';

///block text - See [https://code.google.com/p/blockly/wiki/Text#Text_creation https://code.google.com/p/blockly/wiki/Text#Text_creation], specifically the last picture in the 'Text creation' section.
Blockly.Msg.TEXT_CREATE_JOIN_TITLE_JOIN = 'join';
///tooltip - See [https://code.google.com/p/blockly/wiki/Text#Text_creation https://code.google.com/p/blockly/wiki/Text#Text_creation], specifically the last picture in the 'Text creation' section.
Blockly.Msg.TEXT_CREATE_JOIN_TOOLTIP = 'Add, remove, or reorder sections to reconfigure this text block.';

///block text - See [https://code.google.com/p/blockly/wiki/Text#Text_creation https://code.google.com/p/blockly/wiki/Text#Text_creation], specifically the last picture in the 'Text creation' section.
Blockly.Msg.TEXT_CREATE_JOIN_ITEM_TITLE_ITEM = 'item';
///block text - See [https://code.google.com/p/blockly/wiki/Text#Text_creation https://code.google.com/p/blockly/wiki/Text#Text_creation], specifically the last picture in the 'Text creation' section.
Blockly.Msg.TEXT_CREATE_JOIN_ITEM_TOOLTIP = 'Add an item to the text.';

///url - This and the other text-related URLs are going to be hard to translate.  It is okay to (1) leave in the English-language URL, (2) leave blank, or (3) use a general URL about how computers represent text (such as the translation of [http://en.wikipedia.org/wiki/String_(computer_science) this Wikipedia page]) for all of these URLs.
Blockly.Msg.TEXT_APPEND_HELPURL = 'http://www.liv.ac.uk/HPC/HTMLF90Course/HTMLF90CourseNotesnode91.html';
///block input text - Text preceding the name of a variable to which text should be appended, as in: Append text 'hello' '''to''' mystring'.  See [https://code.google.com/p/blockly/wiki/Text#Text_modification https://code.google.com/p/blockly/wiki/Text#Text_modification].
Blockly.Msg.TEXT_APPEND_TO = 'to';
///block input text - Indication that the following piece of text should be appended [to a variable specified earlier] (see [https://code.google.com/p/blockly/wiki/Text#Text_modification Text modification]).
Blockly.Msg.TEXT_APPEND_APPENDTEXT = 'append text';
///block text - Placeholder for the name of a variable to which text should be appended.  See [https://code.google.com/p/blockly/wiki/Text#Text_modification https://code.google.com/p/blockly/wiki/Text#Text_modification].
Blockly.Msg.TEXT_APPEND_VARIABLE = 'item';
///tooltip - See [https://code.google.com/p/blockly/wiki/Text#Text_modification https://code.google.com/p/blockly/wiki/Text#Text_modification].\n\nParameters:\n* %1 - the name of the variable to which text should be appended.
Blockly.Msg.TEXT_APPEND_TOOLTIP = 'Append some text to variable "%1".';

///url - Information about text on computers (usually referred to as 'strings').
Blockly.Msg.TEXT_LENGTH_HELPURL = 'https://code.google.com/p/blockly/wiki/Text#Text_modification';
///block text - See [https://code.google.com/p/blockly/wiki/Text#Text_length https://code.google.com/p/blockly/wiki/Text#Text_length].
Blockly.Msg.TEXT_LENGTH_INPUT_LENGTH = 'length of';
///tooltip - See [https://code.google.com/p/blockly/wiki/Text#Text_length https://code.google.com/p/blockly/wiki/Text#Text_length].
Blockly.Msg.TEXT_LENGTH_TOOLTIP = 'Returns number of letters (including spaces) in the provided text.';

///url - Information about empty pieces of text on computers (usually referred to as 'empty strings').
Blockly.Msg.TEXT_ISEMPTY_HELPURL = 'https://code.google.com/p/blockly/wiki/Text#Checking_for_empty_text';
///block text - See [https://code.google.com/p/blockly/wiki/Text#Checking_for_empty_text https://code.google.com/p/blockly/wiki/Text#Checking_for_empty_text].
Blockly.Msg.TEXT_ISEMPTY_INPUT_ISEMPTY = 'is empty';
///tooltip - See [https://code.google.com/p/blockly/wiki/Text#Checking_for_empty_text https://code.google.com/p/blockly/wiki/Text#Checking_for_empty_text].
Blockly.Msg.TEXT_ISEMPTY_TOOLTIP = 'Returns true if the provided text is empty.';

///url - Information about finding a character in a piece of text.
Blockly.Msg.TEXT_INDEXOF_HELPURL = 'https://code.google.com/p/blockly/wiki/Text#Finding_text';
///tooltip - See [https://code.google.com/p/blockly/wiki/Text#Finding_text https://code.google.com/p/blockly/wiki/Text#Finding_text].
Blockly.Msg.TEXT_INDEXOF_TOOLTIP = 'Returns the index of the first/last occurrence of first text in the second text.  Returns 0 if text is not found.';
///block text - Title of blocks allowing users to find text.  See [https://code.google.com/p/blockly/wiki/Text#Finding_text https://code.google.com/p/blockly/wiki/Text#Finding_text].
Blockly.Msg.TEXT_INDEXOF_INPUT_INTEXT = 'in text';
///dropdown - See [https://code.google.com/p/blockly/wiki/Text#Finding_text https://code.google.com/p/blockly/wiki/Text#Finding_text].
Blockly.Msg.TEXT_INDEXOF_OPERATOR_FIRST = 'find first occurrence of text';
///dropdown - See [https://code.google.com/p/blockly/wiki/Text#Finding_text https://code.google.com/p/blockly/wiki/Text#Finding_text].
Blockly.Msg.TEXT_INDEXOF_OPERATOR_LAST = 'find last occurrence of text';

///url - Information about extracting characters (letters, number, symbols, etc.) from text.
Blockly.Msg.TEXT_CHARAT_HELPURL = 'http://publib.boulder.ibm.com/infocenter/lnxpcomp/v8v101/index.jsp?topic=%2Fcom.ibm.xlcpp8l.doc%2Flanguage%2Fref%2Farsubex.htm';
///block text - Appears before the piece of text from which a letter (or number, punctuation character, etc.) should be extracted, as in: get first letter '''in text''' 'hello'.  See [https://code.google.com/p/blockly/wiki/Text#Extracting_a_single_character https://code.google.com/p/blockly/wiki/Text#Extracting_a_single_character].
Blockly.Msg.TEXT_CHARAT_INPUT_INTEXT = 'in text';
///dropdown - Indicates that the letter (or number, punctuation character, etc.) with the specified index should be obtained from the preceding piece of text.  See [https://code.google.com/p/blockly/wiki/Text#Extracting_a_single_character https://code.google.com/p/blockly/wiki/Text#Extracting_a_single_character].
Blockly.Msg.TEXT_CHARAT_FROM_START = 'get letter #';
///block text - Indicates that the letter (or number, punctuation character, etc.) with the specified index from the end of a given piece of text should be obtained. See [https://code.google.com/p/blockly/wiki/Text#Extracting_text https://code.google.com/p/blockly/wiki/Text#Extracting_text].
Blockly.Msg.TEXT_CHARAT_FROM_END = 'get letter # from end';
///block text - Indicates that the first letter of the following piece of text should be retrieved (see [indicates that the first letter of the following piece of text should be retrieved.  See [https://code.google.com/p/blockly/wiki/Text#Extracting_a_single_character https://code.google.com/p/blockly/wiki/Text#Extracting_a_single_character].
Blockly.Msg.TEXT_CHARAT_FIRST = 'get first letter';
///block text - Indicates that the last letter (or number, punctuation mark, etc.) of the following piece of text should be retrieved.  See [https://code.google.com/p/blockly/wiki/Text#Extracting_a_single_character https://code.google.com/p/blockly/wiki/Text#Extracting_a_single_character].
Blockly.Msg.TEXT_CHARAT_LAST = 'get last letter';
///block text - Indicates that any letter (or number, punctuation mark, etc.) in the following piece of text should be randomly selected.  See [https://code.google.com/p/blockly/wiki/Text#Extracting_a_single_character https://code.google.com/p/blockly/wiki/Text#Extracting_a_single_character].
Blockly.Msg.TEXT_CHARAT_RANDOM = 'get random letter';
///tooltip - See [https://code.google.com/p/blockly/wiki/Text#Extracting_a_single_character https://code.google.com/p/blockly/wiki/Text#Extracting_a_single_character].
Blockly.Msg.TEXT_CHARAT_TOOLTIP = 'Returns the letter at the specified position.';

///See [https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text].
Blockly.Msg.TEXT_SUBSTRING_TOOLTIP = 'Returns a specified portion of the text.';
///url - Information about extracting characters from text.  Reminder: urls are the lowest priority translations.  Feel free to leave blank.
Blockly.Msg.TEXT_SUBSTRING_HELPURL = 'http://publib.boulder.ibm.com/infocenter/lnxpcomp/v8v101/index.jsp?topic=%2Fcom.ibm.xlcpp8l.doc%2Flanguage%2Fref%2Farsubex.htm';
///block text - Precedes a piece of text from which a portion should be extracted.
Blockly.Msg.TEXT_SUBSTRING_INPUT_IN_TEXT = 'in text';
///block text - This text between the input specifying the string and the input specifying the part to extract.  See [https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text].
Blockly.Msg.TEXT_SUBSTRING_INPUT_AT1 = 'get substring from';
///block text - Comes between the two inputs specifying the start and end of a range, as in 'from 3 '''to''' 8'.  See [https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text].
Blockly.Msg.TEXT_SUBSTRING_INPUT_AT2 = 'to';
///dropdown - Indicates that the letter (or number, punctuation character, etc.) with the specified index should be obtained from the preceding piece of text.  See [https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text].
Blockly.Msg.TEXT_SUBSTRING_FROM_START = 'letter #';
///block text - Indicates that the letter (or number, punctuation character, etc.) with the specified index from the end of a given piece of text should be obtained.  See [https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text].
Blockly.Msg.TEXT_SUBSTRING_FROM_END = 'letter # from end';
///block text - Indicates that a region starting with the first letter of the preceding piece of text should be extracted.  See [https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text].
Blockly.Msg.TEXT_SUBSTRING_FIRST = 'first letter';
///block text - Indicates that a region ending with the first letter of the preceding piece of text should be extracted.  See [https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text https://code.google.com/p/blockly/wiki/Text#Extracting_a_region_of_text].
Blockly.Msg.TEXT_SUBSTRING_LAST = 'last letter';

///url - Information about the case of letters (upper-case and lower-case).
Blockly.Msg.TEXT_CHANGECASE_HELPURL = 'http://www.liv.ac.uk/HPC/HTMLF90Course/HTMLF90CourseNotesnode91.html';
///tooltip - Describes a block to adjust the case of letters.  For more information on this block, see [https://code.google.com/p/blockly/wiki/Text#Adjusting_text_case https://code.google.com/p/blockly/wiki/Text#Adjusting_text_case].
Blockly.Msg.TEXT_CHANGECASE_TOOLTIP = 'Return a copy of the text in a different case.';
///block text - Indicates that all of the letters in the following piece of text should be capitalized.  If your language does not use case, you may indicate that this is not applicable to your language.  For more information on this block, see [https://code.google.com/p/blockly/wiki/Text#Adjusting_text_case https://code.google.com/p/blockly/wiki/Text#Adjusting_text_case].
Blockly.Msg.TEXT_CHANGECASE_OPERATOR_UPPERCASE = 'to UPPER CASE';
///block text - Indicates that all of the letters in the following piece of text should be converted to lower-case.  If your language does not use case, you may indicate that this is not applicable to your language.  For more information on this block, see [https://code.google.com/p/blockly/wiki/Text#Adjusting_text_case https://code.google.com/p/blockly/wiki/Text#Adjusting_text_case].
Blockly.Msg.TEXT_CHANGECASE_OPERATOR_LOWERCASE = 'to lower case';
///block text - Indicates that the first letter of each of the following words should be capitalized and the rest converted to lower-case.  If your language does not use case, you may indicate that this is not applicable to your language.  For more information on this block, see [https://code.google.com/p/blockly/wiki/Text#Adjusting_text_case https://code.google.com/p/blockly/wiki/Text#Adjusting_text_case].
Blockly.Msg.TEXT_CHANGECASE_OPERATOR_TITLECASE = 'to Title Case';

///url - Information about trimming (removing) text off the beginning and ends of pieces of text.
Blockly.Msg.TEXT_TRIM_HELPURL = 'http://www.liv.ac.uk/HPC/HTMLF90Course/HTMLF90CourseNotesnode91.html';
///tooltip - See [https://code.google.com/p/blockly/wiki/Text#Trimming_(removing)_spaces https://code.google.com/p/blockly/wiki/Text#Trimming_(removing)_spaces].
Blockly.Msg.TEXT_TRIM_TOOLTIP = 'Return a copy of the text with spaces removed from one or both ends.';
///dropdown - Removes spaces from the beginning and end of a piece of text.  See [https://code.google.com/p/blockly/wiki/Text#Trimming_(removing)_spaces https://code.google.com/p/blockly/wiki/Text#Trimming_(removing)_spaces].
Blockly.Msg.TEXT_TRIM_OPERATOR_BOTH = 'trim spaces from both sides';
///dropdown - Removes spaces from the beginning of a piece of text.  See [https://code.google.com/p/blockly/wiki/Text#Trimming_(removing)_spaces https://code.google.com/p/blockly/wiki/Text#Trimming_(removing)_spaces].
Blockly.Msg.TEXT_TRIM_OPERATOR_LEFT = 'trim spaces from left side';
///dropdown - Removes spaces from the end of a piece of text.  See [https://code.google.com/p/blockly/wiki/Text#Trimming_(removing)_spaces https://code.google.com/p/blockly/wiki/Text#Trimming_(removing)_spaces].
Blockly.Msg.TEXT_TRIM_OPERATOR_RIGHT = 'trim spaces from right side';

///url - Information about displaying text on computers.
Blockly.Msg.TEXT_PRINT_HELPURL = 'http://www.liv.ac.uk/HPC/HTMLF90Course/HTMLF90CourseNotesnode91.html';
///block text - Display the input on the screen.  See [https://code.google.com/p/blockly/wiki/Text#Printing_text https://code.google.com/p/blockly/wiki/Text#Printing_text].
Blockly.Msg.TEXT_PRINT_TITLE_PRINT = 'print';
///tooltip - See [https://code.google.com/p/blockly/wiki/Text#Printing_text https://code.google.com/p/blockly/wiki/Text#Printing_text].
Blockly.Msg.TEXT_PRINT_TOOLTIP = 'Print the specified text, number or other value.';
///url - Information about getting text from users.
Blockly.Msg.TEXT_PROMPT_HELPURL = 'http://www.liv.ac.uk/HPC/HTMLF90Course/HTMLF90CourseNotesnode92.html';
///dropdown - Specifies that a piece of text should be requested from the user with the following message.  See [https://code.google.com/p/blockly/wiki/Text#Printing_text https://code.google.com/p/blockly/wiki/Text#Printing_text].
Blockly.Msg.TEXT_PROMPT_TYPE_TEXT = 'prompt for text with message';
///dropdown - Specifies that a number should be requested from the user with the following message.  See [https://code.google.com/p/blockly/wiki/Text#Printing_text https://code.google.com/p/blockly/wiki/Text#Printing_text].
Blockly.Msg.TEXT_PROMPT_TYPE_NUMBER = 'prompt for number with message';
///dropdown - Precedes the message with which the user should be prompted for a number.  See [https://code.google.com/p/blockly/wiki/Text#Printing_text https://code.google.com/p/blockly/wiki/Text#Printing_text].
Blockly.Msg.TEXT_PROMPT_TOOLTIP_NUMBER = 'Prompt for user for a number.';
///dropdown - Precedes the message with which the user should be prompted for some text.  See [https://code.google.com/p/blockly/wiki/Text#Printing_text https://code.google.com/p/blockly/wiki/Text#Printing_text].
Blockly.Msg.TEXT_PROMPT_TOOLTIP_TEXT = 'Prompt for user for some text.';

// Lists Blocks.
///url - Information on empty lists.
Blockly.Msg.LISTS_CREATE_EMPTY_HELPURL = 'http://en.wikipedia.org/wiki/Linked_list#Empty_lists';
///block text - See [https://code.google.com/p/blockly/wiki/Lists#create_empty_list https://code.google.com/p/blockly/wiki/Lists#create_empty_list].
Blockly.Msg.LISTS_CREATE_EMPTY_TITLE = 'create empty list';
///block text - See [https://code.google.com/p/blockly/wiki/Lists#create_empty_list https://code.google.com/p/blockly/wiki/Lists#create_empty_list].
Blockly.Msg.LISTS_CREATE_EMPTY_TOOLTIP = 'Returns a list, of length 0, containing no data records';

///tooltip - See [https://code.google.com/p/blockly/wiki/Lists#create_list_with https://code.google.com/p/blockly/wiki/Lists#create_list_with].
Blockly.Msg.LISTS_CREATE_WITH_TOOLTIP = 'Create a list with any number of items.';
///block text - See [https://code.google.com/p/blockly/wiki/Lists#create_list_with https://code.google.com/p/blockly/wiki/Lists#create_list_with].
Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH = 'create list with';
///block text - This appears in a sub-block when [https://code.google.com/p/blockly/wiki/Lists#changing_number_of_inputs changing the number of inputs in a ''''create list with'''' block].
Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TITLE_ADD = 'list';
///tooltip - See [https://code.google.com/p/blockly/wiki/Lists#changing_number_of_inputs https://code.google.com/p/blockly/wiki/Lists#changing_number_of_inputs].
Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TOOLTIP = 'Add, remove, or reorder sections to reconfigure this list block.';
///block text - This appears in a sub-block when [https://code.google.com/p/blockly/wiki/Lists#changing_number_of_inputs changing the number of inputs in a ''''create list with'''' block].
Blockly.Msg.LISTS_CREATE_WITH_ITEM_TITLE = 'item';
///tooltip - See [https://code.google.com/p/blockly/wiki/Lists#changing_number_of_inputs https://code.google.com/p/blockly/wiki/Lists#changing_number_of_inputs].
Blockly.Msg.LISTS_CREATE_WITH_ITEM_TOOLTIP = 'Add an item to the list.';

///url - Information about [https://code.google.com/p/blockly/wiki/Lists#create_list_with creating a list with multiple copies of a single item].
Blockly.Msg.LISTS_REPEAT_HELPURL = 'https://code.google.com/p/blockly/wiki/Lists#create_list_with'
///url - See [https://code.google.com/p/blockly/wiki/Lists#create_list_with creating a list with multiple copies of a single item].
Blockly.Msg.LISTS_REPEAT_TOOLTIP = 'Creates a list consisting of the given value repeated the specified number of times.';
///block text - See [https://code.google.com/p/blockly/wiki/Lists#create_list_with https://code.google.com/p/blockly/wiki/Lists#create_list_with].
Blockly.Msg.LISTS_REPEAT_INPUT_WITH = 'create list with item';
///block text - Text in between the input text [provided by the user] and the number of times it should be repeated.  See [https://code.google.com/p/blockly/wiki/Lists#create_list_with https://code.google.com/p/blockly/wiki/Lists#create_list_with].
Blockly.Msg.LISTS_REPEAT_INPUT_REPEATED = 'repeated';
///block text - Text after and the user-supplied count of the number of repetitions.  See [https://code.google.com/p/blockly/wiki/Lists#create_list_with https://code.google.com/p/blockly/wiki/Lists#create_list_with].
Blockly.Msg.LISTS_REPEAT_INPUT_TIMES = 'times';

///url - Information about how the length of a list is computed (i.e., by the total number of elements, not the number of different elements).
Blockly.Msg.LISTS_LENGTH_HELPURL = 'https://code.google.com/p/blockly/wiki/Lists#length_of';
///block text - See [https://code.google.com/p/blockly/wiki/Lists#length_of https://code.google.com/p/blockly/wiki/Lists#length_of].
Blockly.Msg.LISTS_LENGTH_INPUT_LENGTH = 'length of';
///tooltip - See [https://code.google.com/p/blockly/wiki/Lists#length_of https://code.google.com/p/blockly/wiki/Lists#length_of Blockly:Lists:length of].
Blockly.Msg.LISTS_LENGTH_TOOLTIP = 'Returns the length of a list.';

///url - See [https://code.google.com/p/blockly/wiki/Lists#is_empty https://code.google.com/p/blockly/wiki/Lists#is_empty].
Blockly.Msg.LISTS_IS_EMPTY_HELPURL = 'https://code.google.com/p/blockly/wiki/Lists#is_empty';
///block text - See [https://code.google.com/p/blockly/wiki/Lists#is_empty https://code.google.com/p/blockly/wiki/Lists#is_empty].
Blockly.Msg.LISTS_INPUT_IS_EMPTY = 'is empty';
///block tooltip - See [https://code.google.com/p/blockly/wiki/Lists#is_empty https://code.google.com/p/blockly/wiki/Lists#is_empty].
Blockly.Msg.LISTS_TOOLTIP = 'Returns true if the list is empty.';

///block text - Title of blocks operated on [https://code.google.com/p/blockly/wiki/Lists lists].
Blockly.Msg.LISTS_INLIST = 'in list';

///url - See [https://code.google.com/p/blockly/wiki/Lists#Getting_Items_from_a_List https://code.google.com/p/blockly/wiki/Lists#Getting_Items_from_a_List].
Blockly.Msg.LISTS_INDEX_OF_HELPURL = 'https://code.google.com/p/blockly/wiki/Lists#Getting_Items_from_a_List';
Blockly.Msg.LISTS_INDEX_OF_INPUT_IN_LIST = Blockly.Msg.LISTS_INLIST;
/// dropdown - See [https://code.google.com/p/blockly/wiki/Lists#Finding_Items_in_a_List Lists#Finding_Items_in_a_List].
Blockly.Msg.LISTS_INDEX_OF_FIRST = 'find first occurrence of item';
/// dropdown - See [https://code.google.com/p/blockly/wiki/Lists#Finding_Items_in_a_List Lists#Finding_Items_in_a_List].
Blockly.Msg.LISTS_INDEX_OF_LAST = 'find last occurrence of item';
/// dropdown - See [https://code.google.com/p/blockly/wiki/Lists#Finding_Items_in_a_List Lists#Finding_Items_in_a_List].
Blockly.Msg.LISTS_INDEX_OF_TOOLTIP = 'Returns the index of the first/last occurrence of the item in the list.  Returns 0 if text is not found.';

Blockly.Msg.LISTS_GET_INDEX_HELPURL = Blockly.Msg.LISTS_GET_INDEX_HELPURL;
/// dropdown - Indicates that the user wishes to [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item get an item from a list] without removing it from the list.
Blockly.Msg.LISTS_GET_INDEX_GET = 'get';
/// dropdown - Indicates that the user wishes to [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item get and remove an item from a list], as opposed to merely getting it without modifying the list.
Blockly.Msg.LISTS_GET_INDEX_GET_REMOVE = 'get and remove';
/// dropdown - Indicates that the user wishes to [https://code.google.com/p/blockly/wiki/Lists#Removing_an_item remove an item from a list].
Blockly.Msg.LISTS_GET_INDEX_REMOVE = 'remove';
/// dropdown - Indicates that an index relative to the front of the list should be used to [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item retrieve an item from a list].
Blockly.Msg.LISTS_GET_INDEX_FROM_START = '#';
/// dropdown - Indicates that an index relative to the end of the list should be used to [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item access an item in a list].
Blockly.Msg.LISTS_GET_INDEX_FROM_END = '# from end';
/// dropdown - Indicates that the '''first''' item should be [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item accessed in a list].
Blockly.Msg.LISTS_GET_INDEX_FIRST = 'first';
/// dropdown - Indicates that the '''last''' item should be [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item accessed in a list].
Blockly.Msg.LISTS_GET_INDEX_LAST = 'last';
/// dropdown - Indicates that a '''random''' item should be [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item accessed in a list].
Blockly.Msg.LISTS_GET_INDEX_RANDOM = 'random';
/// block text - Title of blocks used for [https://code.google.com/p/blockly/wiki/Lists#Getting_Items_from_a_List getting, removing], [https://code.google.com/p/blockly/wiki/Lists#Adding_Items_to_a_List setting, or inserting] elements of a list.
Blockly.Msg.LISTS_GET_INDEX_INPUT_IN_LIST = Blockly.Msg.LISTS_INLIST;
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item].
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_FROM_START = 'Returns the item at the specified position in a list.  #1 is the first item.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item].
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_FROM_END = 'Returns the item at the specified position in a list.  #1 is the last item.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item].
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_FIRST = 'Returns the first item in a list.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item].
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_LAST = 'Returns the last item in a list.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item].
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_RANDOM = 'Returns a random item in a list.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_and_removing_an_item] (for get/remove and return) and  [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item] for '# from start'.
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FROM_START = 'Removes and returns the item at the specified position in a list.  #1 is the first item.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_and_removing_an_item] (for get/remove and return) and [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item] for '# from end'.
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FROM_END = 'Removes and returns the item at the specified position in a list.  #1 is the last item.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_and_removing_an_item] (for get/remove and return) and [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item] for 'first'.
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FIRST = 'Removes and returns the first item in a list.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_and_removing_an_item] (for get/remove and return) and [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item] for 'last'.
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_LAST = 'Removes and returns the last item in a list.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_and_removing_an_item] (for get/remove and return) and [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item] for 'random'.
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_RANDOM = 'Removes and returns a random item in a list.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_and_removing_an_item] (for get/remove and return) and [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item] for '# from start'.
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_FROM_START = 'Removes the item at the specified position in a list.  #1 is the first item.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_and_removing_an_item] (for remove and return) and [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item] for '# from end'.
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_FROM_END = 'Removes the item at the specified position in a list.  #1 is the last item.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_and_removing_an_item] (for remove and return) and [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item] for 'first'.
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_FIRST = 'Removes the first item in a list.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_and_removing_an_item] (for remove and return) and [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item] for 'last'.
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_LAST = 'Removes the last item in a list.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_and_removing_an_item] (for remove and return) and [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item] for 'random'.
Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_RANDOM = 'Removes a random item in a list.';
/// url
Blockly.Msg.LISTS_SET_INDEX_HELPURL = 'https://code.google.com/p/blockly/wiki/Lists#in_list_..._set';
Blockly.Msg.LISTS_SET_INDEX_INPUT_IN_LIST = Blockly.Msg.LISTS_INLIST;
/// block text - As in: In list [words] '''set''' first as "a" (which replaces the first element in the list with the piece of text "a").  See also [https://code.google.com/p/blockly/wiki/Lists#in_list_..._set https://code.google.com/p/blockly/wiki/Lists#in_list_..._set].
Blockly.Msg.LISTS_SET_INDEX_SET = 'set';
/// block text - As in: In list [words] '''insert at''' first as "a" (which inserts the text "a" before the first element in the list).  See also [https://code.google.com/p/blockly/wiki/Lists#in_list_..._insert_at https://code.google.com/p/blockly/wiki/Lists#in_list_..._insert_at].
Blockly.Msg.LISTS_SET_INDEX_INSERT = 'insert at';
/// block text - The word preceding the item to be added to a list, as in: In list [words] insert at first '''as''' "a" (which inserts the piece of text "a" as the new first element of the list).
Blockly.Msg.LISTS_SET_INDEX_INPUT_TO = 'as';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item} (even though the page describes the "get" block, the idea is the same for the "set" block).
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_FROM_START = 'Sets the item at the specified position in a list.  #1 is the first item.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item} (even though the page describes the "get" block, the idea is the same for the "set" block).
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_FROM_END = 'Sets the item at the specified position in a list.  #1 is the last item.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item} (even though the page describes the "get" block, the idea is the same for the "set" block).
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_FIRST = 'Sets the first item in a list.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item} (even though the page describes the "get" block, the idea is the same for the "set" block).
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_LAST = 'Sets the last item in a list.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item} (even though the page describes the "get" block, the idea is the same for the "set" block).
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_RANDOM = 'Sets a random item in a list.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item} (even though the page describes the "get" block, the idea is the same for the "set" block).
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_FROM_START = 'Inserts the item at the specified position in a list.  #1 is the first item.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item} (even though the page describes the "get" block, the idea is the same for the "set" block).
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_FROM_END = 'Inserts the item at the specified position in a list.  #1 is the last item.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item} (even though the page describes the "get" block, the idea is the same for the "set" block).
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_FIRST = 'Inserts the item at the start of a list.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item} (even though the page describes the "get" block, the idea is the same for the "set" block).
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_LAST = 'Append the item to the end of a list.';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_single_item} (even though the page describes the "get" block, the idea is the same for the "set" block).
Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_RANDOM = 'Inserts the item randomly in a list.';

/// url
Blockly.Msg.LISTS_GET_SUBLIST_HELPURL = 'https://code.google.com/p/blockly/wiki/Lists#Getting_a_sublist';
Blockly.Msg.LISTS_GET_SUBLIST_INPUT_IN_LIST = Blockly.Msg.LISTS_INLIST;
/// block text - Indicates that a [https://code.google.com/p/blockly/wiki/Lists#Getting_a_sublist sublist (portion of an entire list) should be retrieved]  This is followed by information where the sublist should start, as in: '''Get sub-list from''' first to #5.
Blockly.Msg.LISTS_GET_SUBLIST_INPUT_AT1 = 'get sub-list from';
/// block text - Appears between the start and end of a [https://code.google.com/p/blockly/wiki/Lists#Getting_a_sublist sub-list (portion of an entire list) that should be retrieved], as in: Get sub-list from first '''to''' #5.
Blockly.Msg.LISTS_GET_SUBLIST_INPUT_AT2 = 'to';
/// tooltip - See [https://code.google.com/p/blockly/wiki/Lists#Getting_a_sublist].
Blockly.Msg.LISTS_GET_SUBLIST_TOOLTIP = 'Creates a copy of the specified portion of a list.';

/// default name - A simple, general default name for a variable, preferably short.
Blockly.Msg.VARIABLES_DEFAULT_NAME = 'item';

// Variables Blocks.
/// url - Information about ''variables'' in computer programming.  Consider using your language's translation of [http://en.wikipedia.org/wiki/Variable_(computer_science) http://en.wikipedia.org/wiki/Variable_(computer_science)], if it exists.
Blockly.Msg.VARIABLES_GET_HELPURL = 'http://code.google.com/p/blockly/wiki/Variables#Get';
/// block text - This precedes the name of a variable when getting its values.  In most (all?) languages, it should be the empty string.  If unsure, ask yourself if any word should go before "x" in the expression "x + 1".
Blockly.Msg.VARIABLES_GET_TITLE = '';
Blockly.Msg.VARIABLES_GET_ITEM = Blockly.Msg.VARIABLES_DEFAULT_NAME;
/// block text - This follows the name of a variable.  In most (all?) languages, it should be the empty string.  If unsure, ask yourself if any word should go after "x" in the expression "x + 1".
Blockly.Msg.VARIABLES_GET_TAIL = '';
/// tooltip - This gets the value of the named variable without modifying it.
Blockly.Msg.VARIABLES_GET_TOOLTIP = 'Returns the value of this variable.';
/// context menu - Selecting this causes the creation of a block to set (change) the value of this variable.\n\nParameters:\n* %1 - the name of the variable.
Blockly.Msg.VARIABLES_GET_CREATE_SET = 'Create "set %1"';

/// url - Information about ''variables'' in computer programming.  Consider using your language's translation of [http://en.wikipedia.org/wiki/Variable_(computer_science) http://en.wikipedia.org/wiki/Variable_(computer_science)], if it exists.
Blockly.Msg.VARIABLES_SET_HELPURL = 'http://code.google.com/p/blockly/wiki/Variables#Set';
/// block text - The imperative or infinitive form of the verb "set", as in: '''set''' [the value of] x to 7.
Blockly.Msg.VARIABLES_SET_TITLE = 'set';
Blockly.Msg.VARIABLES_SET_ITEM = Blockly.Msg.VARIABLES_DEFAULT_NAME;
/// block text - The word that goes after the name of the variable and its new value in: set [the value of] x '''to''' 7.
Blockly.Msg.VARIABLES_SET_TAIL = 'to';
/// tooltip - This initializes or changes the value of the named variable.
Blockly.Msg.VARIABLES_SET_TOOLTIP = 'Sets this variable to be equal to the input.';
/// context menu - Selecting this causes the creation of a block to get (change) the value of this variable.\n\nParameters:\n* %1 - the name of the variable.
Blockly.Msg.VARIABLES_SET_CREATE_GET = 'Create "get %1"';

// Procedures Blocks.
/// url - Information about defining [http://en.wikipedia.org/wiki/Procedure_(computer_science) functions] that do not have return values.
Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL = 'http://en.wikipedia.org/wiki/Procedure_%28computer_science%29';
/// block text - This precedes the name of the proccedure when defining it.  See [http://blockly-share.appspot.com/static/apps/code/readonly.html?lang=en_us&xml=%3Cblock%20type%3D%22procedures_defnoreturn%22%20x%3D%22-10%22%20y%3D%2213%22%3E%3Cmutation%3E%3C%2Fmutation%3E%3Ctitle%20name%3D%22NAME%22%3Ehave%20dinner%3C%2Ftitle%3E%3Cstatement%20name%3D%22STACK%22%3E%3Cblock%20type%3D%22procedures_callnoreturn%22%3E%3Cmutation%20name%3D%22wash%20hands%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock%20type%3D%22procedures_callnoreturn%22%3E%3Cmutation%20name%3D%22eat%20food%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E example function definition].
Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE = '';
/// default name - This acts as a placeholder for the name of a function on a function definition block, as shown on [http://blockly-share.appspot.com/static/apps/code/readonly.html?xml=%3Cblock%20type%3D%22procedures_defnoreturn%22%3E%3C/block%3E this block].  The user will replace it with the function's name.
Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE = 'do something';
/// block text - This precedes the list of parameters to a function.  See [http://blockly-share.appspot.com/static/apps/code/readonly.html?lang=en&xml=%3Cblock%20type%3D%22procedures_defreturn%22%20inline%3D%22false%22%3E%3Cmutation%3E%3Carg%20name%3D%22x%22%3E%3C%2Farg%3E%3C%2Fmutation%3E%3Ctitle%20name%3D%22NAME%22%3Edouble%20a%20number%3C%2Ftitle%3E%3Cvalue%20name%3D%22RETURN%22%3E%3Cblock%20type%3D%22math_arithmetic%22%20inline%3D%22true%22%3E%3Ctitle%20name%3D%22OP%22%3EADD%3C%2Ftitle%3E%3Cvalue%20name%3D%22A%22%3E%3Cblock%20type%3D%22variables_get%22%3E%3Ctitle%20name%3D%22VAR%22%3Ex%3C%2Ftitle%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cvalue%20name%3D%22B%22%3E%3Cblock%20type%3D%22variables_get%22%3E%3Ctitle%20name%3D%22VAR%22%3Ex%3C%2Ftitle%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3C%2Fblock%3E sample function].
Blockly.Msg.PROCEDURES_BEFORE_PARAMS = 'with:';
/// block text - This appears next to the function's "body", the blocks that should be run when the function is called, as shown in [http://blockly-share.appspot.com/static/apps/code/readonly.html?lang=en_us&xml=%3Cblock%20type%3D%22procedures_defnoreturn%22%20x%3D%22-10%22%20y%3D%2213%22%3E%3Cmutation%3E%3C%2Fmutation%3E%3Ctitle%20name%3D%22NAME%22%3Ehave%20dinner%3C%2Ftitle%3E%3Cstatement%20name%3D%22STACK%22%3E%3Cblock%20type%3D%22procedures_callnoreturn%22%3E%3Cmutation%20name%3D%22wash%20hands%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock%20type%3D%22procedures_callnoreturn%22%3E%3Cmutation%20name%3D%22eat%20food%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E this example function definition].
Blockly.Msg.PROCEDURES_DEFNORETURN_DO = '';
/// tooltip
Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP = 'Creates a function with no output.';

/// url - Information about defining [http://en.wikipedia.org/wiki/Procedure_(computer_science) functions] that have return values.
Blockly.Msg.PROCEDURES_DEFRETURN_HELPURL = 'http://en.wikipedia.org/wiki/Procedure_%28computer_science%29';
Blockly.Msg.PROCEDURES_DEFRETURN_TITLE = '';
Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE = 'do something';
Blockly.Msg.PROCEDURES_DEFRETURN_DO = '';
/// block text - This imperative or infinite verb precedes the value that is used as the return value (output) of this function.  See [http://blockly-share.appspot.com/static/apps/code/readonly.html?lang=en&xml=%3Cblock%20type%3D%22procedures_defreturn%22%20inline%3D%22false%22%3E%3Cmutation%3E%3Carg%20name%3D%22x%22%3E%3C%2Farg%3E%3C%2Fmutation%3E%3Ctitle%20name%3D%22NAME%22%3Edouble%20a%20number%3C%2Ftitle%3E%3Cvalue%20name%3D%22RETURN%22%3E%3Cblock%20type%3D%22math_arithmetic%22%20inline%3D%22true%22%3E%3Ctitle%20name%3D%22OP%22%3EADD%3C%2Ftitle%3E%3Cvalue%20name%3D%22A%22%3E%3Cblock%20type%3D%22variables_get%22%3E%3Ctitle%20name%3D%22VAR%22%3Ex%3C%2Ftitle%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cvalue%20name%3D%22B%22%3E%3Cblock%20type%3D%22variables_get%22%3E%3Ctitle%20name%3D%22VAR%22%3Ex%3C%2Ftitle%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3C%2Fblock%3E sample function that returns a numeric value twice as large as its input].
Blockly.Msg.PROCEDURES_DEFRETURN_RETURN = 'return';
/// tooltip
Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP = 'Creates a function with an output.';

/// alert - The user has created a function with two parameters that have the same name.  Every parameter must have a different name.
Blockly.Msg.PROCEDURES_DEF_DUPLICATE_WARNING = 'Warning: This function has duplicate parameters.';

/// url - Information about calling [http://en.wikipedia.org/wiki/Procedure_(computer_science) functions] that do not return values.
Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL = 'http://en.wikipedia.org/wiki/Procedure_%28computer_science%29';
/// block text - In most (if not all) languages, this will be the empty string.  It precedes the name of the function that should be run.  See, for example, the "eat food" block in [http://blockly-share.appspot.com/static/apps/code/readonly.html?lang=en_us&xml=%3Cblock%20type%3D%22procedures_defnoreturn%22%20x%3D%22-10%22%20y%3D%2213%22%3E%3Cmutation%3E%3C%2Fmutation%3E%3Ctitle%20name%3D%22NAME%22%3Ehave%20dinner%3C%2Ftitle%3E%3Cstatement%20name%3D%22STACK%22%3E%3Cblock%20type%3D%22procedures_callnoreturn%22%3E%3Cmutation%20name%3D%22wash%20hands%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock%20type%3D%22procedures_callnoreturn%22%3E%3Cmutation%20name%3D%22eat%20food%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E this function definition].
Blockly.Msg.PROCEDURES_CALLNORETURN_CALL = '';
/// tooltip - This block causes the body (blocks inside) of the named function definition to be run.
Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP = 'Run the user-defined function "%1".';

/// url - Information about calling [http://en.wikipedia.org/wiki/Procedure_(computer_science) functions] that return values.
Blockly.Msg.PROCEDURES_CALLRETURN_HELPURL = 'http://en.wikipedia.org/wiki/Procedure_%28computer_science%29';
Blockly.Msg.PROCEDURES_CALLRETURN_CALL = Blockly.Msg.PROCEDURES_CALLNORETURN_CALL;
/// tooltip - This block causes the body (blocks inside) of the named function definition to be run.\n\nParameters:\n* %1 - the name of the function.
Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP = 'Run the user-defined function "%1" and use its output.';

/// block text - This text appears on a block in a window that appears when the user clicks on the plus sign or star on [http://blockly-share.appspot.com/static/apps/code/readonly.html?xml=%3Cblock%20type%3D%22procedures_defnoreturn%22%3E%3C/block%3E a function definition block].  It refers to the set of parameters (referred to by the simpler term "inputs") to the function.  See [http://translatewiki.net/wiki/Translating:Blockly#function_definitions this discussion].
Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TITLE = 'inputs';
/// block text - This text appears on a block in a window that appears when the user clicks on the plus sign or star on [http://blockly-share.appspot.com/static/apps/code/readonly.html?xml=%3Cblock%20type%3D%22procedures_defnoreturn%22%3E%3C/block%3E a function definition block].  It appears on the block for adding an individual parameter (referred to by the simpler term "inputs") to the function.  See [http://translatewiki.net/wiki/Translating:Blockly#function_definitions this discussion].
Blockly.Msg.PROCEDURES_MUTATORARG_TITLE = 'input name:';

/// context menu - This appears on the context menu for function calls.  Selecting it causes the corresponding function definition to be highlighted.
Blockly.Msg.PROCEDURES_HIGHLIGHT_DEF = 'Highlight function definition';
/// context menu - This appears on the context menu for function definitions.  Selecting it creates a block to call the function.  \n\nParameters:\n* %1 - the name of the function.
Blockly.Msg.PROCEDURES_CREATE_DO = 'Create "%1"';

/// tooltip - If the first value is true, [http://blockly-share.appspot.com/static/apps/code/readonly.html?lang=en&xml=%3Cblock%20type%3D%22procedures_ifreturn%22%20inline%3D%22true%22%20x%3D%2278%22%20y%3D%22119%22%3E%3Cmutation%20value%3D%221%22%3E%3C%2Fmutation%3E%3Cvalue%20name%3D%22CONDITION%22%3E%3Cblock%20type%3D%22logic_compare%22%20inline%3D%22true%22%3E%3Ctitle%20name%3D%22OP%22%3ELT%3C%2Ftitle%3E%3Cvalue%20name%3D%22A%22%3E%3Cblock%20type%3D%22variables_get%22%3E%3Ctitle%20name%3D%22VAR%22%3Ex%3C%2Ftitle%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cvalue%20name%3D%22B%22%3E%3Cblock%20type%3D%22math_number%22%3E%3Ctitle%20name%3D%22NUM%22%3E0%3C%2Ftitle%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cvalue%20name%3D%22VALUE%22%3E%3Cblock%20type%3D%22math_number%22%3E%3Ctitle%20name%3D%22NUM%22%3E0%3C%2Ftitle%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3C%2Fblock%3E this block] causes the second value to be returned immediately from the function.
Blockly.Msg.PROCEDURES_IFRETURN_TOOLTIP = 'If a value is true, then return a second value.';
/// warning - This appears if the user tries to use [http://blockly-share.appspot.com/static/apps/code/readonly.html?lang=en&xml=%3Cblock%20type%3D%22procedures_ifreturn%22%20inline%3D%22true%22%20x%3D%2278%22%20y%3D%22119%22%3E%3Cmutation%20value%3D%221%22%3E%3C%2Fmutation%3E%3Cvalue%20name%3D%22CONDITION%22%3E%3Cblock%20type%3D%22logic_compare%22%20inline%3D%22true%22%3E%3Ctitle%20name%3D%22OP%22%3ELT%3C%2Ftitle%3E%3Cvalue%20name%3D%22A%22%3E%3Cblock%20type%3D%22variables_get%22%3E%3Ctitle%20name%3D%22VAR%22%3Ex%3C%2Ftitle%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cvalue%20name%3D%22B%22%3E%3Cblock%20type%3D%22math_number%22%3E%3Ctitle%20name%3D%22NUM%22%3E0%3C%2Ftitle%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cvalue%20name%3D%22VALUE%22%3E%3Cblock%20type%3D%22math_number%22%3E%3Ctitle%20name%3D%22NUM%22%3E0%3C%2Ftitle%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3C%2Fblock%3E this block] outside of a function definition.
Blockly.Msg.PROCEDURES_IFRETURN_WARNING = 'Warning: This block may be used only within a function definition.';
