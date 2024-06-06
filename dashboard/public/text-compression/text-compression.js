/* global $ Dialog CodeMirror */

(function() {
  var FIRST_SYMBOL = 0x2600; // ☀
  var LAST_SYMBOL = 0x3000;
  var MAX_DICT_ENTRIES = 112;
  var SYMBOL_REGEX = '\\u' + FIRST_SYMBOL.toString(16) + '-\\u' + LAST_SYMBOL.toString(16);
  var dictEntries = [];
  var missingSymbolsMap = {
    0x2601: 0x271a,
    0x2614: 0x2702,
    0x2615: 0x2706,
    0x2618: 0x2708,
    0x2619: 0x2709,
    0x2626: 0x270c,
    0x2627: 0x270e,
    0x2628: 0x2714,
    0x2629: 0x2718,
    0x262a: 0x2747,
    0x262b: 0x2749,
    0x262c: 0x2756,
    0x262d: 0x2761
  };
  for (var i = FIRST_SYMBOL; i < FIRST_SYMBOL + MAX_DICT_ENTRIES; i++) {
    dictEntries.push(String.fromCharCode(missingSymbolsMap[i] || i));
  }
  dictEntries = dictEntries.sort();
  var poemsList = [
    "So_wake_me_up_when_it's_all_over_When_I'm_wiser_and_I'm_older_All_this_time_I_was_finding_myself_And_I_didn't_know_I_was_lost__Didn't_know_I_was_lost_I_didn't_know_I_was_lost_I_didn't_know_I_was_lost_I_didn't_know_(didn't_know,_didn't_know)",
    "I_Need_a_Dollar_by_Aloe_Blacc_I_need_a_dollar,_dollar_A_dollar_that's_what_I_need_Well_I_need_a_dollar,_dollar_A_dollar_that's_what_I_need_Said_I_said_I_need_dollar,_dollar_A_dollar_that's_what_I_need_And_if_I_share_with_you_my_story_would_you_share_your_dollar_with_me?",
    "The_Man_by_Aloe_Blacc_Well_you_can_tell_everybody_Yeah_you_can_tell_everybody_Go_ahead_and_tell_everybody_I'm_the_man,_I'm_the_man,_I'm_the_man_Well_you_can_tell_everybody_Yeah_you_can_tell_everybody_Go_ahead_and_tell_everybody_I'm_the_man,_I'm_the_man,_I'm_the_man_Yes_I_am,_yes_I_am,_yes_I_am_I'm_the_man,_I'm_the_man,_I'm_the_man",
    "Pitter_patter_pitter_patter_listen_to_the_rain_pitter_patter_pitter_patter_on_the_window_pane",
    "A_tutor_who_tooted_the_flute_Tried_to_tutor_two_tooters_to_toot_Said_the_two_to_their_tutor,_\"Is_it_harder_to_toot_Or_to_tutor_two_tooters_to_toot?\"",
    "She_sells_sea_shells_on_the_sea_shore_The_shells_that_she_sells_are_sea_shells_I\'m_sure_So_if_she_sells_sea_shells_on_the_sea_shore_I'm_sure_that_the_shells_are_sea_shore_shells_",
    "I_know_an_old_lady_who_swallowed_a_bird_How_absurd!_She_swallowed_a_bird!_She_swallowed_the_bird_to_catch_the_spider_That_wriggled_and_jiggled_and_tickled_inside_her_She_swallowed_the_spider_to_catch_the_fly_I_don't_know_why_she_swallowed_a_fly_Perhaps_she'll_die",
    "Pease_porridge_hot_Pease_porridge_cold_Pease_porridge_in_the_pot_Nine_days_old._Some_like_it_hot_Some_like_it_cold_Some_like_it_in_the_pot_Nine_days_old.",
    "Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  ];
  var poemText = poemsList[0];
  var compressedPoemSize = poemText.length;

  window.poemChanged = function () {
    if (poemSelect.length == 0) {
      poemsList.forEach(function (poem) {
        addOptionToPoemSelect(poem);
      });
    }
    setupPoemWithText(poemsList[poemSelect.selectedIndex]);
    compress();
  }

  function showWriteYourOwnDialog() {
    var dialog = new Dialog({
      body: '<div id="enter-your-own" class="modal-content">'
      + '<p class="dialog-title">Enter your own text</p>'
      + '<textarea id="selfEnteredPoem" placeholder="Write or paste your text here." rows="7"></textarea>'
      + '<button id="again-button" style="margin: 0;">Cancel</button>'
      + '<button id="continue-button" style="float: right; margin: 0;">Add</button>'
      + '</div>'
    });
    dialog.show();
    $('#enter-your-own #again-button').click(function () {
      dialog.hide();
    });
    $('#enter-your-own #continue-button').click(function() {
      var newPoemText = document.getElementById('selfEnteredPoem').value;
      poemsList.push(newPoemText);
      addOptionToPoemSelect('Custom: ' + newPoemText);
      poemSelect.selectedIndex = poemSelect.length - 1;
      setupPoemWithText(poemsList[poemSelect.selectedIndex]);
      dialog.hide();
    });
  }

  function addOptionToPoemSelect(text) {
    var option = document.createElement("option");
    option.text = text.substring(0, 37).replace(/_/g, " ") + "...";
    poemSelect.add(option, null);
  }

  function setupPoemWithText(text) {
    text = text.replace(/[ \n]/g, "_");
    document.getElementById("compressedPoem").innerHTML = text;
    poemText = text;
    // Note: compress will call calculateData to update view once it's finished
    compress();
  }

  function calculateData(errorInDictionary) {
    var text = editor.getValue();
    var dictSize = text.length + 1;
    if (text.length === 0) {
      dictSize = 0;
    }

    var total = dictSize + compressedPoemSize;
    var compression = (1 - (total / poemText.length)) * 10000;
    compression = Math.round(compression) / 100;
    var compressionClass = '';
    if (errorInDictionary) {
      compressionClass = 'error';
      compression = 'Error in dictionary';
    } else {
      if (compression > 0) {
        compressionClass = 'positive';
      } else if (compression < 0) {
        compressionClass = 'negative';
      }
      compression += '%';
    }
    document.getElementById("data").innerHTML =  "Compressed text size: " + compressedPoemSize + " bytes\n"
      + "     Dictionary size: " + dictSize + " bytes\n"
      + "               Total: " + total + " bytes\n"
      + "  Original text size: " + poemText.length + " bytes\n"
      + "         Compression: <span class='" + compressionClass + "'>" + compression + "</span>\n";
  }

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function compress() {
    var poemDisplay = poemText;
    var dict = editor.getValue().split("\n").slice(0, MAX_DICT_ENTRIES);
    var errorInDictionary = false;

    var validRules = dict.map(function (rule, index) {
      var line = editor.getLineHandle(index);
      if (new RegExp('[' + dictEntries[index] + '-\\u' + LAST_SYMBOL.toString(16) + ']').test(rule)) {
        editor.addLineClass(line, 'wrap', 'dict-error');
        errorInDictionary = true;
        return '';
      }
      editor.removeLineClass(line, 'wrap', 'dict-error');
      return rule;
    });

    validRules.forEach(function (rule, i) {
      if (rule !== "") {
        poemDisplay = poemDisplay.replace(new RegExp(escapeRegExp(rule), "gi"), dictEntries[i]);
      }
    });

    compressedPoemSize = poemDisplay.length;
    document.getElementById("compressedPoem").innerHTML = poemDisplay.replace(
      new RegExp('[' + SYMBOL_REGEX + ']+', "g"), "<mark>$&</mark>");
    calculateData(errorInDictionary);
  }

  var $dictionary = $('#dictionary');
  var options = window.options || {};

// Level builder settings
  if (options.shortInstructions) {
    $('#widgetInstructions').text(options.shortInstructions);
  }
  if (options.poems) {
    poemsList = options.poems;
  }
  if (poemsList.length === 1) {
    $('.choosePoem').hide();
  }
  $dictionary.val(options.dictionary);

  var poemSelect = document.getElementById("poemsList");
  $('#writeYourOwn').click(showWriteYourOwnDialog);
  window.editor = CodeMirror.fromTextArea($dictionary[0], {
    lineNumbers: true,
    lineWrapping: true,
    firstLineNumber: 0,
    lineNumberFormatter: function (line) {
      return dictEntries[line] || '';
    }
  });
  editor.on("change", compress);
  editor.on("keypress", function (cm, e) {
    if (e.keyCode === 32) {
      CodeMirror.e_stop(e);
      cm.replaceSelection('_');
    }
  });
  editor.setSize('100%', '100%');
  poemChanged();
})();
