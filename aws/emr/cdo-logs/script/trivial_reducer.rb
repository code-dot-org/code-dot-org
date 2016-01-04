#!/usr/bin/ruby

# This implements the trivial reducer, e.g., the reducer that emits all inputs
# without mutation.
# CAUTION: This should only be used with mappers that emit a very limited number
# of lines.
ARGF.each do |line|
  puts line
end
