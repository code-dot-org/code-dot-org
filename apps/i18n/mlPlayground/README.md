mlPlayground stores translations for the external repository 
[ml-playground](https://github.com/code-dot-org/ml-playground).

`en_us.json` is empty because the authority for the English content lives in the external
repository. This file should continue to be empty. The file is empty because our javascript build 
process assumes there is always an `en_us.json` file. The non-English JSON files contain content because 
we gather translations and then pass them to the external repo code.
