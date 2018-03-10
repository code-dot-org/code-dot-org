class MultiDSL < MatchDSL
  def right(text, feedback: nil)
    answer(text, true, feedback)
  end

  def wrong(text, feedback: nil)
    answer(text, false, feedback)
  end
end
