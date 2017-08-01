class MultiDSL < MatchDSL
  def right(text, feedback: feedback = nil) answer(text, true, feedback) end

  def wrong(text, feedback: feedback = nil) answer(text, false, feedback) end
end
