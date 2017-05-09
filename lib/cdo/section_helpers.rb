require_relative 'code_generation'

module SectionHelpers
  # @return [String] A semi-random vowelless string of length six.
  # @param reject_if [Proc] return true if a code should be rejected and replaced by a new one (optional)
  def self.random_code(reject_if: nil)
    CodeGeneration.random_code(6, reject_if)
  end
end
