#!/usr/bin/env ruby

TUTORIAL = "blockly".freeze

# This mapper emits all lines associated with the blockly tutorial.
# EX: YYYY-MM-DDTHH:MM:SS.XXXXXXZ production-pegasus 0.0.0.0:00000 0.0.0.0:00 0.0000 0.0000 0.000000 N N 0 0 "GET https://code.org:443/images/fit-520/blockly.jpg HTTP/1.1" "Amazon CloudFront" ECDHE-RSA-AES128-SHA TLSv1
# Based on EMR data, there are approximately 300 on normal days and 1000 on HOC
# days. Thus, this data can be passed through the trivial reducer safely.
ARGF.each do |line|
  if line.include? TUTORIAL
    puts line
  end
end
