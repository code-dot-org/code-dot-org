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
#   Each for of the CSV should contain a user_id, level_id, best_result,
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
    data[row[1]] = row[4..13]
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
  return 1.0 if best_result == 100 && num_hints == 0 && num_authored_hints == 0
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
# @return [Float] a post proficiency belief for the fixed concept.
def new_proficiency(prior, difficulty, user_level_data)
  actual = perfect_without_hints(*user_level_data)
  expected = get_expected_score(prior, difficulty)
  prior + KAPPA * (actual - expected)
end

# @param user_data [Hash[Integer, Array[Integer]]] mapping from level_id to a
#   user_level summary.
# @param lcd [Hash[Integer, Array[Integer]]] mapping from level_id to a
#   LevelConceptDifficult summary.
# @param concept [Symbol] the concept to process
def process_user(user_data, lcd, concept)
  lcd_index = CONCEPT_TO_INDEX_HASH[concept]
  proficiency = 0
  user_data.each do |level_id, level_data|
    puts "  PROCESSING #{concept} , #{level_id}..."
    next unless lcd[level_id][lcd_index] > 0
    next if level_data[0] == 30
    puts "    PRIOR: #{proficiency}"
    proficiency = new_proficiency(proficiency, lcd[level_id][lcd_index], level_data)
    puts "    POST: #{proficiency}  (#{level_data} , #{lcd[level_id][lcd_index]})"
  end
end

# @param data [Hash] ...
# @param lcd [Hash] ...
# @param concept [Symbol | nil] the concept which should be analyzed, with nil
#   specifying that all concepts should be analyzed
# @param user [Integer | nil] the user to analyze, with nil specifying that all
#   users (in the data file) should be analyzed
def process_data(data, lcd, concept, user)
  data.each do |user_id, user_data|
    next if user && user_id != user
    puts "PROCESSING USER #{user_id}..."
    CONCEPT_TO_INDEX_HASH.keys.each do |concept_key|
      unless concept && concept != concept_key
        process_user(user_data, lcd, concept_key)
      end
    end
  end
end

def main
  data = read_data_file ARGV[0]
  lcd = read_lcd_file ARGV[1]
  concept = ARGV[2] == 'all' ? nil : ARGV[2].to_sym
  user = ARGV[3] == 'all' ? nil : ARGV[3].to_i

  process_data(data, lcd, concept, user)
end

main
