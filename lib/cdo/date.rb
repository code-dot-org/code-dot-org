class DateTime
  def to_solr
    "#{self.new_offset(0).to_s.split('+').first}Z"
  end

  def to_milliseconds
    self.strftime('%Q').to_i
  end
end
