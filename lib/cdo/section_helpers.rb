module SectionHelpers
  CHARS = ("A".."Z").to_a - %w(A E I O U)
  def self.random_text(len)
    len.times.to_a.collect{ CHARS.sample }.join
  end

  def self.random_code
    random_text(6)
  end
end
