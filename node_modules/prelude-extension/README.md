Prelude Extension
=============================================

[![Build Status](https://travis-ci.org/furqanZafar/prelude-extension.svg?branch=master)](https://travis-ci.org/furqanZafar/prelude-extension)
[![Coverage Status](https://coveralls.io/repos/furqanZafar/prelude-extension/badge.svg?branch=master&service=github)](https://coveralls.io/github/furqanZafar/prelude-extension?branch=master)

# Install
`npm install prelude-extension`

# Functions
`batch :: Number -> [a] -> [[a]]`

`clamp :: Number -> Number -> Number`

`find-all :: String -> String -> Int -> [Int]`

`get :: a -> [String] -> b`

`is-empty-object :: object -> Boolean`

`is-equal-to-object :: a -> b -> Boolean`

`mappend :: a -> [String] -> b -> (b -> b -> b) -> a` 

`partition-string :: String -> String -> [[Int, Int, Bool]]`

`rextend :: a -> b -> c`

`set :: a -> [String] -> b -> a`

`transpose :: [[a]] -> [[a]]`

`unwrap :: ([String] -> a -> b) -> Int -> c -> [b]`

# Development
* run `gulp` to watch and build changes to `index.ls`
* `npm test` for running unit tests
* `npm run coverage` for running unit tests with code coverage