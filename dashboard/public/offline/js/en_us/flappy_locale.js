!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),(o.blockly||(o.blockly={})).appLocale=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module "+o+"");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){var MessageFormat = window.messageformat;MessageFormat.locale.en=function(n){return n===1?"one":"other"}
exports.continue = function(d){return "Continue"};

exports.doCode = function(d){return "do"};

exports.elseCode = function(d){return "else"};

exports.endGame = function(d){return "end game"};

exports.endGameTooltip = function(d){return "Ends the game."};

exports.finalLevel = function(d){return "Congratulations! You have solved the final puzzle."};

exports.flap = function(d){return "flap"};

exports.flapRandom = function(d){return "flap a random amount"};

exports.flapVerySmall = function(d){return "flap a very small amount"};

exports.flapSmall = function(d){return "flap a small amount"};

exports.flapNormal = function(d){return "flap a normal amount"};

exports.flapLarge = function(d){return "flap a large amount"};

exports.flapVeryLarge = function(d){return "flap a very large amount"};

exports.flapTooltip = function(d){return "Fly Flappy upwards."};

exports.flappySpecificFail = function(d){return "Your code looks good - it will flap with each click. But you need to click many times to flap to the target."};

exports.incrementPlayerScore = function(d){return "score a point"};

exports.incrementPlayerScoreTooltip = function(d){return "Add one to the current player score."};

exports.nextLevel = function(d){return "Congratulations! You have completed this puzzle."};

exports.no = function(d){return "No"};

exports.numBlocksNeeded = function(d){return "This puzzle can be solved with %1 blocks."};

exports.playSoundRandom = function(d){return "play random sound"};

exports.playSoundBounce = function(d){return "play bounce sound"};

exports.playSoundCrunch = function(d){return "play crunch sound"};

exports.playSoundDie = function(d){return "play sad sound"};

exports.playSoundHit = function(d){return "play smash sound"};

exports.playSoundPoint = function(d){return "play point sound"};

exports.playSoundSwoosh = function(d){return "play swoosh sound"};

exports.playSoundWing = function(d){return "play wing sound"};

exports.playSoundJet = function(d){return "play jet sound"};

exports.playSoundCrash = function(d){return "play crash sound"};

exports.playSoundJingle = function(d){return "play jingle sound"};

exports.playSoundSplash = function(d){return "play splash sound"};

exports.playSoundLaser = function(d){return "play laser sound"};

exports.playSoundTooltip = function(d){return "Play the chosen sound."};

exports.reinfFeedbackMsg = function(d){return "You can press the \"Try again\" button to go back to playing your game."};

exports.scoreText = function(d){return "Score: "+v(d,"playerScore")};

exports.setBackground = function(d){return "set scene"};

exports.setBackgroundRandom = function(d){return "set scene Random"};

exports.setBackgroundFlappy = function(d){return "set scene City (day)"};

exports.setBackgroundNight = function(d){return "set scene City (night)"};

exports.setBackgroundSciFi = function(d){return "set scene Sci-Fi"};

exports.setBackgroundUnderwater = function(d){return "set scene Underwater"};

exports.setBackgroundCave = function(d){return "set scene Cave"};

exports.setBackgroundSanta = function(d){return "set scene Santa"};

exports.setBackgroundTooltip = function(d){return "Sets the background image"};

exports.setGapRandom = function(d){return "set a random gap"};

exports.setGapVerySmall = function(d){return "set a very small gap"};

exports.setGapSmall = function(d){return "set a small gap"};

exports.setGapNormal = function(d){return "set a normal gap"};

exports.setGapLarge = function(d){return "set a large gap"};

exports.setGapVeryLarge = function(d){return "set a very large gap"};

exports.setGapHeightTooltip = function(d){return "Sets the vertical gap in an obstacle"};

exports.setGravityRandom = function(d){return "set gravity random"};

exports.setGravityVeryLow = function(d){return "set gravity very low"};

exports.setGravityLow = function(d){return "set gravity low"};

exports.setGravityNormal = function(d){return "set gravity normal"};

exports.setGravityHigh = function(d){return "set gravity high"};

exports.setGravityVeryHigh = function(d){return "set gravity very high"};

exports.setGravityTooltip = function(d){return "Sets the level's gravity"};

exports.setGround = function(d){return "set ground"};

exports.setGroundRandom = function(d){return "set ground Random"};

exports.setGroundFlappy = function(d){return "set ground Ground"};

exports.setGroundSciFi = function(d){return "set ground Sci-Fi"};

exports.setGroundUnderwater = function(d){return "set ground Underwater"};

exports.setGroundCave = function(d){return "set ground Cave"};

exports.setGroundSanta = function(d){return "set ground Santa"};

exports.setGroundLava = function(d){return "set ground Lava"};

exports.setGroundTooltip = function(d){return "Sets the ground image"};

exports.setObstacle = function(d){return "set obstacle"};

exports.setObstacleRandom = function(d){return "set obstacle Random"};

exports.setObstacleFlappy = function(d){return "set obstacle Pipe"};

exports.setObstacleSciFi = function(d){return "set obstacle Sci-Fi"};

exports.setObstacleUnderwater = function(d){return "set obstacle Plant"};

exports.setObstacleCave = function(d){return "set obstacle Cave"};

exports.setObstacleSanta = function(d){return "set obstacle Chimney"};

exports.setObstacleLaser = function(d){return "set obstacle Laser"};

exports.setObstacleTooltip = function(d){return "Sets the obstacle image"};

exports.setPlayer = function(d){return "set player"};

exports.setPlayerRandom = function(d){return "set player Random"};

exports.setPlayerFlappy = function(d){return "set player Yellow Bird"};

exports.setPlayerRedBird = function(d){return "set player Red Bird"};

exports.setPlayerSciFi = function(d){return "set player Spaceship"};

exports.setPlayerUnderwater = function(d){return "set player Fish"};

exports.setPlayerCave = function(d){return "set player Bat"};

exports.setPlayerSanta = function(d){return "set player Santa"};

exports.setPlayerShark = function(d){return "set player Shark"};

exports.setPlayerEaster = function(d){return "set player Easter Bunny"};

exports.setPlayerBatman = function(d){return "set player Bat guy"};

exports.setPlayerSubmarine = function(d){return "set player Submarine"};

exports.setPlayerUnicorn = function(d){return "set player Unicorn"};

exports.setPlayerFairy = function(d){return "set player Fairy"};

exports.setPlayerSuperman = function(d){return "set player Flappyman"};

exports.setPlayerTurkey = function(d){return "set player Turkey"};

exports.setPlayerTooltip = function(d){return "Sets the player image"};

exports.setScore = function(d){return "set score"};

exports.setScoreTooltip = function(d){return "Sets the player's score"};

exports.setSpeed = function(d){return "set speed"};

exports.setSpeedTooltip = function(d){return "Sets the level's speed"};

exports.shareFlappyTwitter = function(d){return "Check out the Flappy game I made. I wrote it myself with @codeorg"};

exports.shareGame = function(d){return "Share your game:"};

exports.soundRandom = function(d){return "random"};

exports.soundBounce = function(d){return "bounce"};

exports.soundCrunch = function(d){return "crunch"};

exports.soundDie = function(d){return "sad"};

exports.soundHit = function(d){return "smash"};

exports.soundPoint = function(d){return "point"};

exports.soundSwoosh = function(d){return "swoosh"};

exports.soundWing = function(d){return "wing"};

exports.soundJet = function(d){return "jet"};

exports.soundCrash = function(d){return "crash"};

exports.soundJingle = function(d){return "jingle"};

exports.soundSplash = function(d){return "splash"};

exports.soundLaser = function(d){return "laser"};

exports.speedRandom = function(d){return "set speed random"};

exports.speedVerySlow = function(d){return "set speed very slow"};

exports.speedSlow = function(d){return "set speed slow"};

exports.speedNormal = function(d){return "set speed normal"};

exports.speedFast = function(d){return "set speed fast"};

exports.speedVeryFast = function(d){return "set speed very fast"};

exports.whenClick = function(d){return "when click"};

exports.whenClickTooltip = function(d){return "Execute the actions below when a click event occurs."};

exports.whenCollideGround = function(d){return "when hit the ground"};

exports.whenCollideGroundTooltip = function(d){return "Execute the actions below when Flappy hits the ground."};

exports.whenCollideObstacle = function(d){return "when hit an obstacle"};

exports.whenCollideObstacleTooltip = function(d){return "Execute the actions below when Flappy hits an obstacle."};

exports.whenEnterObstacle = function(d){return "when pass obstacle"};

exports.whenEnterObstacleTooltip = function(d){return "Execute the actions below when Flappy enters an obstacle."};

exports.whenRunButtonClick = function(d){return "when game starts"};

exports.whenRunButtonClickTooltip = function(d){return "Execute the actions below when the game starts."};

exports.yes = function(d){return "Yes"};

},{"messageformat":"messageformat"}]},{},[1])(1)});