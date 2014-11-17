require "csv"

class Match < DSLDefined
  def dsl_default
    <<ruby
name 'unique level name here'
title 'title'
description 'description here'
question 'Question'
answer 'Answer 1'
ruby
  end

end
