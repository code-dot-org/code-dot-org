import conditionalsUrl from '@cdo/static/json/jsonVideo/examples/Conditionals_V1.json';
import functionsUrl from '@cdo/static/json/jsonVideo/examples/Functions_V1.json';
import functionsWithParametersUrl from '@cdo/static/json/jsonVideo/examples/Functions_With_Parameters_V1.json';
import ifElseUrl from '@cdo/static/json/jsonVideo/examples/If_Else_V1.json';
import painterObjectUrl from '@cdo/static/json/jsonVideo/examples/Painter_Object_V1.json';
import variablesUrl from '@cdo/static/json/jsonVideo/examples/Variables_V1.json';
import whileLoopUrl from '@cdo/static/json/jsonVideo/examples/While_Loops_V1.json';

type JsonVideoFileObject = {
  description: string;
  url: string;
};

/**
 *  Importing from @cdo/static/json doesn't actually import the file but rather a path to
 *  the file. We need to assert the result is a string.
 **/

export const jsonVideoFiles: JsonVideoFileObject[] = [
  {
    description:
      'This video covers the basics of variables, describing them as labeled containers or boxes that store information in memory. It introduces three fundamental data types: Integers (Ints), Strings, and Booleans. The speech explains how to assign values using the equal sign and how to use the print function to output these values by referencing the variable name without quotes.',
    url: variablesUrl as unknown as string,
  },
  {
    description:
      'This video introduces the concept of conditional statements in programming. It explains that a conditional is a decision point that tells the computer to execute certain code only if a specific condition is true. Using Python as an example, it covers the syntax of the if statement, the importance of the colon, and how indentation defines which lines of code belong to the conditional block.',
    url: conditionalsUrl as unknown as string,
  },
  {
    description:
      'This video builds upon basic conditionals by introducing two-way selection using the if-else statement. It explains that while a simple if statement is a one-way selection (it does nothing if the condition is false), the else keyword provides an alternative path. It uses a real-world analogy of finishing homework to illustrate how the program skips the if block and runs the else block when a condition is not met.',
    url: ifElseUrl as unknown as string,
  },
  {
    description:
      'This video provides an overview of functions, describing them as named blocks of code designed to perform specific tasks. It walks through the steps of defining a function using the def keyword, naming it, and using proper syntax (parentheses, colons, and indentation). Finally, it explains how to call a function to execute the instructions stored inside its definition.',
    url: functionsUrl as unknown as string,
  },
  {
    description:
      'This video explains functions with parameters by using the analogy of a "fill-in-the-blank" sentence. It defines a parameter as a placeholder (the blank space) and an argument as the actual value provided to fill that space. The lesson highlights that parameters are used to make code more reusable and easier to understand by allowing the same function to work with different values.',
    url: functionsWithParametersUrl as unknown as string,
  },
  {
    description:
      'This video explains the While Loop, a structure used to repeat instructions to keep code clean and organized. It uses a flowchart analogy to show how a computer checks a condition: if the condition is true, the code inside the loop runs; if false, the computer exits the loop. The video also covers the Python syntax for while loops, emphasizing the keyword while, the condition, and the required indentation for the repeated steps.',
    url: whileLoopUrl as unknown as string,
  },
  {
    description:
      'This video introduces the "Painter" object used in certain code.org python levels. It explains the relationship between a class (the blueprint) and an object (the specific instance, like \'alice\' or \'bob\'). It defines attributes as things the object knows and methods as actions it can perform. Finally, it demonstrates the "dot operator" syntax used to call methods on a specific object.',
    url: painterObjectUrl as unknown as string,
  },
];
