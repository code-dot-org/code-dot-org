#!/usr/bin/ruby

# This mapper emits all lines associated with the blockly tutorial.
# Based on EMR data, there are approximately 300 on normal days and 1000 on HOC
# days. Thus, this data can be passed through the trivial reducer safely.
ARGF.each do |line|
  if line.include? "blockly"
    puts line
  end
end
