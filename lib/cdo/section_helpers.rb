module SectionHelpers
  CHARS = ("A".."Z").to_a - %w(A E I O U)

  def self.random_text(len)
    len.times.to_a.collect {CHARS.sample}.join
  end

  # @return [String] A semi-random vowelless string of length six.
  def self.random_code
    loop do
      code = random_text(6)
      # Avoid various naughty substrings.
      next if %w(CNT DCK DMN FCK PNS PSS SHT TTS).any? {|substring| code.include? substring}
      return code
    end
  end
end
