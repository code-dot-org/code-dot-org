class MultiDSL < MatchDSL
  def right(text, feedback: nil)
    answer(text, true, feedback)
  end

  def wrong(text, feedback: nil)
    answer(text, false, feedback)
  end

  def stay_on_level_after_submit(text)
    @hash[:stay_on_level_after_submit] = text
  end
end
