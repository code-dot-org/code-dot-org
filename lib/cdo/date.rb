class DateTime
  def to_solr
    "#{new_offset(0).to_s.split('+').first}Z"
  end

  def to_milliseconds
    strftime('%Q').to_i
  end
end
