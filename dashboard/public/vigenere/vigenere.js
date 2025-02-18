/* global $, options, dashboard */
// options is appOptions.level, from the level parameters themselves

var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_";
var LETTERS = ALPHABET.split('');

function vigenereLetter(x, y) {
  return LETTERS[(x+y) % LETTERS.length];
}

var IS_ENCRYPTING = true;

var timerId;

var key;
var keyIndex = 0;

var inputMessage;
var outputMessage;

var paused = true;

// DOM elements
var plaintext_input, keyword_input, vigenere_table;
var input_display, keyword_display, output_display;
var input_label, output_label;
var play_button, pause_button;

$(document).ready(function () {
  plaintext_input = $("#plaintext-input");
  keyword_input = $("#keyword-input");

  keyword_display = $("#keyword-display");
  input_display = $("#input-display");
  output_display = $("#output-display");

  input_label = $("label[for=input-display]");
  output_label = $("label[for=output-display]");

  play_button = $("#action-toggle button[title=play]");
  pause_button = $("#action-toggle button[title=pause]");

  vigenere_table = $("#vigenere-table");

  renderVigenereTable();

  cleanInput(plaintext_input);
  cleanInput(keyword_input);

  $("#mode-toggle button").on("click", function (changeEvent) {
    var mode = changeEvent.target.value;
    IS_ENCRYPTING = (mode === 'encrypt');
    restart();
  });

  $("#mode-toggle button[value=encrypt]").click();
  $("#speedSlider").slider({
    max: 1000,
    min: 0,
    value: 500,
    change: setTimerFromSlider
  });

  $("#finished").click(function () {
    var finishedButton = $(this);

    if (finishedButton.prop("disabled") === true) {
      return;
    }

    finishedButton.prop("disabled", true);
    dashboard.widget.processResults(function (willRedirect) {
      if (!willRedirect) {
        finishedButton.prop("disabled", false);
      }
    });
  });
});

function renderVigenereTable() {
  var table = $("<table>");
  var tbody = $("<tbody>");

  // make header
  tbody.append(function () {
    var header = $("<tr>");
    header.append("<th>");
    LETTERS.forEach(function (letter) {
      header.append("<th>" + letter + "</th>");
    });
    return header;
  });

  // Make body
  LETTERS.forEach(function (letter, i) {
    var row = $("<tr>");
    row.append("<th>" + letter + "</th>");
    LETTERS.forEach(function (_, j) {
      row.append($("<td>", {
        'html': vigenereLetter(i, j)
      }));
    });
    tbody.append(row);
  });

  table.html(tbody);
  vigenere_table.html(table);
}

function clearVigenereTableHighlights(row, col) {
  var tbody = vigenere_table.find('tbody');
  tbody.find(".highlight").removeClass();
}

function highlightVigenereTable(row, col) {

  clearVigenereTableHighlights();

  var tbody = vigenere_table.find('tbody');


  // We increment row and column to skip the header row and columns
  row = row + 1;
  col = col + 1;

  tbody.children(":eq(" + row + ")").children(":lt(" + col + ")").addClass("highlight");
  tbody.children(":lt(" + row + ")").children(":nth-child(" + (col + 1) + ")").addClass("highlight");
  tbody.children(":eq(" + row + ")").children().first().addClass("key");

  if (IS_ENCRYPTING) {
    tbody.children(":eq(" + row + ")").children(":eq(" + col + ")").addClass("highlight ciphertext");
    tbody.children().first().children(":nth-child(" + (col + 1) + ")").addClass("plaintext");
  } else {
    tbody.children(":eq(" + row + ")").children(":eq(" + col + ")").addClass("highlight plaintext");
    tbody.children().first().children(":nth-child(" + (col + 1) + ")").addClass("ciphertext");
  }
}

function highlightCharacter(id, originalText, indexToHighlight) {
  var newStr = originalText.substring(0, indexToHighlight);
  newStr += "<mark>" + originalText.charAt(indexToHighlight) + "</mark>";
  newStr += originalText.substring(indexToHighlight + 1, originalText.length);
  $(id).html(newStr);
}

function decryptNextCharacter(skipAnimation) {

  skipAnimation = skipAnimation || false;

  if (inputMessage.length <= 0) {
    clearTimer();
    keyword_display.html(keyword_input.val());
    input_display.html(plaintext_input.val());
    output_display.html(outputMessage);
    return false;
  }

  //find next key val
  var keyChar = keyword_input.val().charAt(keyIndex);

  //find next char to decode
  var cipherChar = inputMessage.charAt(0);
  inputMessage = inputMessage.substring(1, inputMessage.length);

  //find the column in the box array that matches the char
  var N = LETTERS.length;
  var keyRow = LETTERS.indexOf(keyChar);
  var cipherCol = (LETTERS.indexOf(cipherChar) - LETTERS.indexOf(keyChar) + N) % N;

  var plainChar = vigenereLetter(0, cipherCol);
  outputMessage += plainChar;

  if (skipAnimation === false) {
    highlightVigenereTable(keyRow, cipherCol);
    highlightCharacter(keyword_display, key, keyIndex);
    highlightCharacter(input_display, plaintext_input.val(), outputMessage.length - 1);
    highlightCharacter(output_display, outputMessage, outputMessage.length - 1);
  }

  keyIndex = (keyIndex + 1) % keyword_input.val().length;

  return true;
}

function encryptNextCharacter(skipAnimation) {

  skipAnimation = skipAnimation || false;

  if (inputMessage.length <= 0) {
    clearTimer();
    keyword_display.html(keyword_input.val());
    input_display.html(plaintext_input.val());
    output_display.html(outputMessage);
    return false;
  }

  var nextChar = inputMessage.charAt(0);
  inputMessage = inputMessage.substring(1, inputMessage.length);

  var keyChar = key.charAt(keyIndex);

  var row = LETTERS.indexOf(keyChar);
  var col = LETTERS.indexOf(nextChar);

  var nextEncryptedChar = vigenereLetter(row, col);
  outputMessage += nextEncryptedChar;

  if (skipAnimation === false) {
    highlightVigenereTable(row, col);
    highlightCharacter(keyword_display, key, keyIndex);
    highlightCharacter(input_display, plaintext_input.val(), outputMessage.length - 1);
    highlightCharacter(output_display, outputMessage, outputMessage.length - 1);
  }

  keyIndex = (keyIndex + 1) % key.length;

  return true;
}

function clean(text) {
  return text.toUpperCase()
    .replace(/ /g, "_")
    .replace(/[^A-Z_]/g, "");
}

function cleanBlock(block) {
  var text = $(block).html();
  $(block).html(clean(text));
}
function cleanInput(input) {
  var text = $(input).val();
  $(input).val(clean(text));
}

function encodeFullText() {
  setup();
  if (IS_ENCRYPTING === true) {
    while (encryptNextCharacter(true)) {}
  } else {
    while (decryptNextCharacter(true)) {}
  }
}

function encodeNextCharacter() {
  if (IS_ENCRYPTING === true) {
    encryptNextCharacter();
  } else {
    decryptNextCharacter();
  }
}

function setTimerFromSlider() {
  setTimer(1000 - $("#speedSlider").slider("value"));
}

function clearTimer() {
  clearInterval(timerId);
  timerId = undefined;
}

function setTimer(ms) {
  //if changing delay want to clear old timer anyway
  // or old one will continue to be called in separate
  // thread
  clearTimer();

  if (ms >= 0) {
    if (IS_ENCRYPTING === true) {
      timerId = setInterval(encryptNextCharacter, ms);
    } else {
      timerId = setInterval(decryptNextCharacter, ms);
    }
  }
}

function pause() {
  clearTimer();
  paused = true;
  pause_button.button('toggle');
}

function play() {
  setTimerFromSlider();
  paused = false;
  play_button.button('toggle');
}

function restart() {
  setup();
  pause();
}


function setup() {
  outputMessage = "";
  keyIndex = 0;

  key = clean(keyword_input.val());
  inputMessage = clean(plaintext_input.val());

  keyword_display.html(key);
  input_display.html(inputMessage);
  output_display.html("&nbsp;");

  if (IS_ENCRYPTING === true) {
    input_label.html("Plaintext");
    output_label.html("Ciphertext");
  } else {
    output_label.html("Plaintext");
    input_label.html("Ciphertext");
  }

  clearVigenereTableHighlights();
}
