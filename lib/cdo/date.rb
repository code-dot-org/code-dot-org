class DateTime
  def to_solr
    "#{self.new_offset(0).to_s.split('+').first}Z"
  end
end
