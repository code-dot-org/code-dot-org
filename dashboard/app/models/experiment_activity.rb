class ExperimentActivity < ActiveRecord::Base

  belongs_to :activity

  # Experiments
  @@is_experimenting_feedback_design = false

  # Experiment types
  TYPE_FEEDBACK_DESIGN_WHITE = 'white_background'
  TYPE_FEEDBACK_DESIGN_YELLOW = 'yellow_background'
  TYPES_FEEDBACK_DESIGN = [ TYPE_FEEDBACK_DESIGN_WHITE, TYPE_FEEDBACK_DESIGN_YELLOW ]

  public
  def white_background?
    self.feedback_design == TYPE_FEEDBACK_DESIGN_WHITE
  end

  def yellow_background?
    self.feedback_design == TYPE_FEEDBACK_DESIGN_YELLOW
  end

  def self.is_experimenting_feedback_design?
    @@is_experimenting_feedback_design
  end

  def self.set_experimenting_feedback_design(is_active)
    @@is_experimenting_feedback_design = is_active;
  end

  def self.get_feedback_design(activity_id)
    if activity_id
      activity = Activity.find(activity_id)
      # Select the design to be experimented on
      if activity.user_id
        target_design = self.pick_mod_length(TYPES_FEEDBACK_DESIGN, activity.user_id)
        # Record
        ExperimentActivity.create(activity_id: activity_id, feedback_design: target_design);
        target_design
      end
    end
  end

  def self.pick_mod_length(array, index)
    array[index % array.length]
  end

  # Returns nil if parameter not found, zero, or if :to_i fails.
  # Note that this uses :to_i, which processes leading digits,
  # so a parameter value of "123z" would yield 123.
  def self.try_get_int_parameter(uri_string, param_name)
    return nil unless uri_string
    params = Rack::Utils.parse_query URI(uri_string).query rescue nil
    val = params && params[param_name].try(:to_i)
    val if val && val > 0
  end

  def self.is_experimenting_feedback?(level_source)
    false
=begin
    return false if not level_source
    level = level_source.level

    # Stanford hints only exist for two levels:
    # http://learn.code.org/s/1/level/5 (level_id == 3 in prod) and
    # http://learn.code.org/s/1/level/19 (level_id == 17 in prod)
    level.game.name == 'Maze' &&
        (level.name == 'Level3' && level.level_num == '2_3' ||
            level.name == 'Level17' && level.level_num == '2_17')
=end
  end

  def self.feedback_experiment_param(url)
    x = self.try_get_int_parameter(url, 'feedback_experiment')
    return x && x != 0
  end

  FEEDBACK_EXPERIMENT_SOURCES = [LevelSourceHint::CROWDSOURCED,
                                 LevelSourceHint::STANFORD, nil]
  FEEDBACK_EXPERIMENT_PARAMETER = 'stanford_experiment'

  # Hint visibility experiment is currently taking place at four levels.
  # While not all level_nums are unique, these appear to be.
  EXPERIMENT_LEVEL_NUMS = [
      # Two levels with high completion rates.
      'karel_1_2',  # http://learn.code.org/s/1/level/48 (level_id == 34 in prod)
      '4_6',        # http://learn.code.org/s/1/level/40 (level_id == 92 in prod)
      # Two levels with low completion rates.
      '1_7',        # http://learn.code.org/s/1/level/30 (level_id == 25 in prod)
      'karel_1_11'  # http://learn.code.org/s/1/level/57 (level_id == 43 in prod)
  ]

  def self.is_experimenting_hint_visibility?(level_source)
    false
=begin
    return false if not level_source
    EXPERIMENT_LEVEL_NUMS.include? level_source.level.level_num
=end
  end

  def self.feedback_experiment_param(url)
    self.try_get_int_parameter(url, 'feedback_experiment') > 0
  end

  HINT_VISIBILITY_VALUES = [ActivityHint::VISIBILITY_SHOW_HINT,
                            ActivityHint::VISIBILITY_OFFER_HINT_LEFT,
                            ActivityHint::VISIBILITY_OFFER_HINT_RIGHT]

  VISIBILITY_EXPERIMENT_PARAMETER = 'hint_visibility_experiment'

  # Return the penultimate section of an ip address, as an int, to use as a hash value.
  # This returns nil if the parameter is not in the form 'n.n.n.n', where each n
  # is a possibly distinct integer.  We don't use the last section, since we 
  # want everyone in the same classroom to have the same hash value.
  def self.ip_to_hash_value(ip)
    return nil unless ip
    parts = ip.split('.')
    return nil unless parts.length == 4
    # Don't return the int version of the third section unless all of its
    # characters were interpreted by to_i, which is silent about non-digits.
    parts[2].to_i if parts[2].to_i.to_s == parts[2]
  end

  # Select a hint (and related properties), taking into account any experiments.
  #
  # The following attributes of the options parameter may be used:
  # - level_source must be provided for a hint to be found.
  # - current_user may be null.
  # - ip may be null; otherwise, string with dotted decimal ip address (e.g., '1.2.3.4').
  # - uri may be null (hint parameters will be pulled from it if present).
  # - activity: must be provided for any experiments to be logged to ActivityHint.
  # - enable_external_hints may be true, in which case external hints will
  #   be used.  This should be true in production and when testing production
  #   code and false otherwise, to avoid confusion when the level_sources used in
  #   external hints differ across the different environments.
  #
  # Zero or more of the following attributes will be in the return hash:
  # - hint: the text of the hint.
  # - hint_request_placement: one of the values in HINT_VISIBILITY_VALUES.
  # - activity_hint: the ActivityHint logging the experiment details.
  def self.determine_hint(options)
    response = {}

    # Get a level-specific hint, if one exists.
    specific_hint = options[:level_source] &&
        (options[:level_source].get_crowdsourced_hint ||
         (options[:enable_external_hints] && options[:level_source].get_external_hint))

    in_hint_experiment = false

    # Extract hash keys from parameters for manually testing experiments.
    stanford_experiment_hash = self.try_get_int_parameter(
        options[:uri], FEEDBACK_EXPERIMENT_PARAMETER)
    hint_visibility_experiment_hash = self.try_get_int_parameter(
        options[:uri], VISIBILITY_EXPERIMENT_PARAMETER)

    # If we are doing the Stanford hint experiment, choose the hint from the appropriate source.
    if (stanford_experiment_hash ||
         (options[:enable_external_hints] &&
             self.is_experimenting_feedback?(options[:level_source]) &&
             options[:current_user])) &&
        specific_hint
      in_hint_experiment = true
      hash_value = stanford_experiment_hash || ip_to_hash_value(options[:ip]) || 0
      response[:hint] = options[:level_source].get_hint_from_source(
          self.pick_mod_length(FEEDBACK_EXPERIMENT_SOURCES, hash_value))
    else
      response[:hint] = specific_hint
    end

    # If we are doing the hint visibility experiment, set response[:hint_request_placement].
    if hint_visibility_experiment_hash ||
        (self.is_experimenting_hint_visibility?(options[:level_source]) && options[:current_user])
      in_hint_experiment = true
      hash_value = hint_visibility_experiment_hash || ip_to_hash_value(options[:ip]) || 0
      response[:hint_request_placement] =
          self.pick_mod_length(HINT_VISIBILITY_VALUES, hash_value)
    end

    # If in an experiment, record values written to options.
    if in_hint_experiment && options[:activity]
      response[:activity_hint] = ActivityHint.create!(
          activity_id: options[:activity].id,
          level_source_hint_id: response[:hint] && response[:hint].id,
          hint_visibility: response[:hint_request_placement],
          # Since this is guarded by in_hint_experiment, hash_value must be
          # defined and numeric.
          ip_hash: hash_value
      )
    end

    # Just provide the text of the hint, not its metadata.
    if response[:hint]
      response[:hint] = response[:hint].hint
    end

    response
  end
end
