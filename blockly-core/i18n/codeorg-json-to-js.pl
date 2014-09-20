#!/usr/bin/perl

if (@ARGV != 1) {
  die "Use via codeorg-messages.sh";
};

($js_locale) = @ARGV;

print "goog.provide('Blockly.Msg.${js_locale}');\n";
print "goog.require('Blockly.Msg');\n";

$message_count = 0;

while (<STDIN>) {
  if (/^ *"(.*?)": *(".*"),? *$/) {
    $message_count++;
    print "Blockly.Msg.$1 = $2;\n";
  }
}

if (!$message_count) {
  die "No strings for $js_locale";
}
