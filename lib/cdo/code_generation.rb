module CodeGeneration
  CONSONANTS = ('A'..'Z').to_a - %w(A E I O U)
  BANNED_SUBSTRINGS = %w(CNT DCK DMN FCK PNS PSS SHT TTS)
  MAX_ATTEMPTS = 100

  # Generates a semi-random consonant string of the specified length,
  # excluding banned substrings.
  # @param length [Integer] length of returned random code (default 6)
  # @param reject_if [Proc] return true if a code should be rejected and replaced by a new one (optional)
  # @return [String] generated code
  def self.random_code(length = 6, reject_if: nil)
    MAX_ATTEMPTS.times do
      code = random_consonant_string(length)
      # Avoid various naughty substrings.
      next if BANNED_SUBSTRINGS.any? {|substring| code.include? substring}
      next if reject_if && reject_if.call(code)
      return code
    end

    raise "Unable to generate a valid code in #{MAX_ATTEMPTS} attempts."
  end

  # Generates a random consonant string of the specified length
  # @param length [Integer] length of returned random string
  # @return [String] generated string
  def self.random_consonant_string(length)
    length.times.to_a.collect {CONSONANTS.sample}.join
  end
end
