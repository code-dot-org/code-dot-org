# Fixing a concept C and restricting to levels testing (only) C, the ELO Model
# we use assumes the probability of success is a function of the difficulty D of
# the level and the actual proficiency AP of the user. This probability is given
# by the function
#
#   Prob_C(D, AP) = 1 / (1 + EXP(alpha * (AP - D))
#
# where alpha is some pre-determined constant.
#
#
# Given progress (via a UserLevel) on a level with difficulty D for concept C,
# we update the measured proficiency MP by the function
#
#   MP_new = MP_old + kappa * (actual - Prob_C(D, MP_old))
#
# where kappa is some pre-determined constant and actual is the outcome in the
# UserLevel.

# USAGE: ruby experimental/csf_proficiency/elo_modeling.rb user_data.csv level_concept_difficulty.csv {'all' | user_id} {'all' | concept} [out_file.csv]

require 'csv'

# Picked so that Prob_C(D, AP) = 0.9 anytime AP - D = 1.
ALPHA = -Math.log(9)
# Picked magically so that both old (via MP_old) and new (via actual) progress
# have significant impact on measured proficiency (via MP_new).
KAPPA = 0.5
# Mapping from concepts to array index position.
CONCEPT_TO_INDEX_HASH = {
  sequencing: 0,
  debugging: 1,
  repeat_loops: 2,
  repeat_until_while: 3,
  for_loops: 4,
  events: 5,
  variables: 6,
  functions: 7,
  functions_with_params: 8,
  conditionals: 9
}.freeze

# @param file [String] filepath to a CSV containing UserLevel summary data.
#   Each line of the CSV should contain a user_id, level_id, best_result,
#   num attempts, num_hints, and num_authored_hints.
# @return [Hash[Integer, Hash]] hash mapping user_ids to hashes, themselves
#   mapping level_id to user_level information.
def read_data_file(file)
  data = Hash.new {|h, k| h[k] = Hash.new {|hp, kp| hp[kp] = {}}}
  CSV.foreach(file) do |row|
    row = row.map(&:to_i)
    data[row[0]][row[1]] = row[2..5]
  end
  data
end

# @param file [String] filepath to a CSV containing LevelConceptDifficulty
#   summary data.
# @return [Hash[Integer, Array[Integer]]] mapping from level_id to
#   LevelConceptDifficulty data.
def read_lcd_file(file)
  data = {}
  CSV.foreach(file) do |row|
    row = row.map(&:to_i)
    data[row[2]] = row[4..13]
  end
  data
end

# @param best_result [Integer] the best result of the UserLevel.
# @param attempts [Integer] the number of attempts of the UserLevel.
# @param num_hints [Integer] the number of hints associated with the UserLevel.
# @param num_authored_hints [Integer] the number of authored hints associated
#   with the UserLevel.
# @return [Float] whether the level was passed perfectly without hints.
def perfect_without_hints(best_result, attempts, num_hints, num_authored_hints)
  raise ArgumentError.new('FreePlay') if best_result == 30
  return 1.0 if best_result > 30 && num_hints == 0 && num_authored_hints == 0
  0.0
end

# @param prior [Float] the measured prior proficiency for the user.
# @param difficulty [Integer] the difficulty of the level.
# @return [Float] the expected probability of success.
def get_expected_score(prior, difficulty)
  diff = prior - difficulty
  1.0 / (1 + Math.exp(ALPHA * diff))
end

# @param prior [Float] the prior proficiency belief for a fixed concept.
# @param difficulty [Integer] the difficulty for the fixed concept of the
#   level.
# @param user_level_data [Array[Integer]] a user_levels summary for the level.
# @return [Float] a post proficiency belief for the fixed concept, truncated to
#   the interval [0, 6].
def new_proficiency(prior, difficulty, user_level_data)
  return prior if user_level_data[0] == 30
  actual = perfect_without_hints(*user_level_data)
  expected = get_expected_score(prior, difficulty)
  post = prior + KAPPA * (actual - expected)
  [[0.0, post].max, 6.0].min
end

# @param user_level_data [...]
# @param level_data [Array[FixNum] an array of length ten, giving the
#   level_concept_difficulties for the level.
# @param prior_proficiency [Array[FixNum]] an array of length ten, giving the
#   prior measured proficiency for the ten concepts.
# @returns [Array[FixNum]] an array of length ten, giving the post measured
#   proficiency for the ten concepts.
def process_level(user_level_data, level_data, prior_proficiency)
  post_proficiency = prior_proficiency.clone
  level_data.each_with_index do |level_concept_difficulty, index|
    next unless level_concept_difficulty > 0
    post_proficiency[index] = new_proficiency(
      prior_proficiency[index],
      level_concept_difficulty,
      user_level_data
    )
  end
  post_proficiency
end

# @param data [Hash] ...
# @param lcd [Hash] ...
# @param user [Integer | nil] the user to analyze, with nil specifying that all
#   users (in the data file) should be analyzed
# @returns [Array[Array[FixNum]] an array of arrays of measured proficiencies,
#   with each outer array corresponding to the post proficiency of a level
def process_data(data, lcd, user)
  output = []
  data.each do |user_id, user_data|
    next if user && user_id != user
    current_user_proficiency = Array.new(10, 0)
    lcd.each do |level_id, level_data|
      if user_data.key? level_id
        user_level_data = user_data[level_id]
        current_user_proficiency = process_level(
          user_level_data,
          level_data,
          current_user_proficiency
        )
      end
      output << current_user_proficiency
    end
  end
  output
end

# @param concept [String | nil] the concept to filter output to, with nil
#   specifying all concepts should be output
# @param output [Array[Array[String]]] an array of arrays of strings to be
#   written to out_file
# @param out_file [String] the filepath to write output to
def write_output(concept, output, out_file)
  # TODO(asher): Filter by the concept argument.
  CSV.open(out_file, 'w') do |csv|
    output.each do |line|
      csv << line
    end
  end
end

def main
  data = read_data_file ARGV[0]
  lcd = read_lcd_file ARGV[1]
  concept = ARGV[2] == 'all' ? nil : ARGV[2].to_sym
  user = ARGV[3] == 'all' ? nil : ARGV[3].to_i
  out_file = ARGV[4]

  output = process_data(data, lcd, user)

  write_output(concept, output, out_file) if out_file
end

main
