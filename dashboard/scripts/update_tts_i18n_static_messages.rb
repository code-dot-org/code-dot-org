#!/usr/bin/env ruby
require_relative('../config/environment')

# Simple script for creating TTS audio files for some of our clientside
# feedback strings and UI elements; all those strings for which we
# generate the TTS URL clientside rather than somewhere in dashboard.

# TODO: (elijah) consider integrating this into the sync-codeout-out
# script

# TODO: (elijah) formalize a process for flagging these strings somewhere
# in apps code, rather than maintaining this ugly manual Hash

FEEDBACK_MESSAGES = {
  "jigsaw": {
    "reinfFeedbackMsg": "You can press the \"Try again\" button to go back to playing your game."
  },
  "studio": {
    "hoc2015_shareGame": "Share your game:",
    "shareGame": "Share your story:"
  },
  "common": {
    "emptyBlocksErrorMsg": "The \"Repeat\" or \"If\" block needs to have other blocks inside it to work. Make sure the inner block fits properly inside the containing block.",
    "emptyFunctionBlocksErrorMsg": "The function block needs to have other blocks inside it to work.",
    "errorEmptyFunctionBlockModal": "There need to be blocks inside your function definition. Click \"edit\" and drag blocks inside the green block.",
    "errorGenericLintError": "Your program contains an editor warning that needs to be corrected. Hover over the icons near the line numbers in the editor to learn more.",
    "errorIncompleteBlockInFunction": "Click \"edit\" to make sure you don't have any blocks missing inside your function definition.",
    "errorParamInputUnattached": "Remember to attach a block to each parameter input on the function block in your workspace.",
    "errorQuestionMarksInNumberField": "Try replacing \"???\" with a value.",
    "errorUnusedFunction": "You created a function, but never used it on your workspace! Click on \"Functions\" in the toolbox and make sure you use it in your program.",
    "errorUnusedParam": "You added a parameter block, but didn't use it in the definition. Make sure to use your parameter by clicking \"edit\" and placing the parameter block inside the green block.",
    "extraTopBlocks": "You have unattached blocks.",
    "hintPromptInline": "Do you want a hint?",
    "keepPlaying": "Keep playing",
    "levelIncompleteError": "Keep coding! Something's not quite right yet.",
    "missingRecommendedBlocksErrorMsg": "Not quite. Try using a block you aren’t using yet.",
    "missingRequiredBlocksErrorMsg": "Not quite. You have to use a block you aren’t using yet.",
    "nestedForSameVariable": "You're using the same variable inside two or more nested loops. Use unique variable names to avoid infinite loops.",
    "nextPuzzle": "Next puzzle",
    "recommendedBlockContextualHintTitle": "Try using a block like this to solve the puzzle.",
    "shareFailure": "Sorry, we can't share this program.",
    "tooMuchWork": "You made me do a lot of work!  Could you try repeating fewer times?",
    "tryAgain": "Try again",
    "tryBlocksBelowFeedback": "Try using one of the blocks below:"
  },
  "craft": {
    "generatedCodeDescription": "By dragging and placing blocks in this puzzle, you've created a set of instructions in a computer language called Javascript. This code tells computers what to display on the screen. Everything you see and do in Minecraft also starts with lines of computer code like these.",
    "reinfFeedbackMsg": "You can press \"Keep Playing\" to go back to playing your game."
  },
  "maze": {
    "collectorCollectedNothing": "Keep coding! You need to collect as many of the items as you can.",
    "collectorCollectedTooMany": "That space doesn't have enough items for me to collect.",
    "didNotCollectEverything": "Make sure you don't leave any nectar or honey behind!",
    "didNotPlantEverywhere": "Make sure you plant something in every soil patch!",
    "flowerEmptyError": "The flower you're on has no more nectar.",
    "honeycombFullError": "This honeycomb does not have room for more honey.",
    "insufficientHoney": "You need to make the right amount of honey.",
    "insufficientNectar": "You need to collect the right amount of nectar.",
    "notAtFlowerError": "You can only get nectar from a flower.",
    "notAtHoneycombError": "You can only make honey at a honeycomb.",
    "plantInNonSoilError": "I can only plant something in fresh soil.",
    "uncheckedCloudError": "Make sure to check all clouds to see if they're flowers or honeycombs.",
    "uncheckedPurpleError": "Make sure to check all purple flowers to see if they have nectar"
  },
  "turtle": {
    "lengthFeedback": "You got it right except for the lengths to move.",
    "reinfFeedbackMsg": "Here is your drawing! Keep working on it or continue to the next puzzle.",
    "shareDrawing": "Share your drawing:"
  }
}.freeze

VOICES.each do |lang, _voice|
  I18n.locale = lang
  loc_voice = TextToSpeech.localized_voice
  apps_locale = lang.to_s.sub('-', '_').downcase

  puts lang

  FEEDBACK_MESSAGES.each do |category, keys|
    file = File.read("../../apps/i18n/#{category}/#{apps_locale}.json")
    messages = JSON.parse(file)

    puts "\t#{category}"

    keys.each do |key, _message|
      puts "\t\t#{key}"
      text = messages[key.to_s]

      content_hash = Digest::MD5.hexdigest(text)
      filename = "#{loc_voice[:VOICE]}/#{loc_voice[:SPEED]}/#{loc_voice[:SHAPE]}/#{content_hash}/#{text}.mp3"
      TextToSpeech.tts_upload_to_s3(text, filename)
    end
  end
end
