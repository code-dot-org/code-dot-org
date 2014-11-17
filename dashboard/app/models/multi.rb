require "csv"

class Multi < Match
  def dsl_default
    <<ruby
name 'unique level name here'
title 'title'
description 'description here'
question 'Question'
wrong 'wrong answer'
right 'right answer'
ruby
  end

end
