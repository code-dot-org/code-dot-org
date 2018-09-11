class DateTime
  def to_milliseconds
    strftime('%Q').to_i
  end
end
