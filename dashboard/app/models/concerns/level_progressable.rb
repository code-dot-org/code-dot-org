# frozen_string_literal: true

require 'cdo/activity_constants'

# Shared behavior for records that track progress on a level in a unit.
module LevelProgressable
  extend ActiveSupport::Concern

  included do
    store :properties, accessors: %i[locale locale_supported], coder: JSON

    belongs_to :script, class_name: 'Unit', optional: true
    belongs_to :level
    belongs_to :unit_group, optional: true
    belongs_to :level_source, optional: true

    before_save :assign_locale_data, if: :new_record?, unless: :locale
    before_save :refresh_locale_supported, if: -> {locale_changed? || script_id_changed?}
    before_save :reset_best_result, if: ->(progress) {progress.submitted_changed? from: true, to: false}

    scope :by_lesson, ->(lesson) {where(script: lesson.script, level: lesson.script_levels.map(&:level_ids).flatten)}
    # TODO(asher): Consider making these scopes and the methods below more consistent, in tense and in word choice.
    scope :attempted, -> {where.not(best_result: nil)}
    scope :passing, -> {where('best_result >= ?', ActivityConstants::MINIMUM_PASS_RESULT)}
    scope :perfect, -> {where('best_result > ?', ActivityConstants::MAXIMUM_NONOPTIMAL_RESULT)}
  end

  def attempted?
    !best_result.nil?
  end

  def perfect?
    ActivityConstants.perfect?(best_result)
  end

  def finished?
    ActivityConstants.finished?(best_result)
  end

  def passing?
    ActivityConstants.passing?(best_result)
  end

  def calculate_total_time_spent(additional_time)
    existing_time_spent = time_spent ? time_spent : 0
    additional_time && additional_time > 0 ? existing_time_spent + additional_time : existing_time_spent
  end

  # First ScriptLevel in this Unit containing this Level.
  # Cached equivalent to `level.script_levels.where(script_id: script.id).first`.
  def script_level
    s = Unit.get_from_cache(script_id)
    s.script_levels.detect {|sl| sl.level_ids.include? level_id}
  end

  def assign_locale_data(locale = I18n.locale)
    self.locale = locale.to_s.presence
    refresh_locale_supported
  end

  def resolved_unit
    (script_id && Unit.get_from_cache(script_id)) || script
  end

  def update_progress!(
    new_result:,
    submitted:,
    unit_group_id: nil,
    level_source_id: nil,
    is_navigator: false,
    time_spent: nil,
    locale: nil
  )
    self.unit_group_id = unit_group_id if unit_group_id && new_record?
    self.level_source_id = level_source_id if level_source_id && !is_navigator
    self.submitted = submitted

    # Update level_progress_record with the new attempt.
    # We increment the attempt count unless they've already perfected the level.
    self.attempts += 1 unless perfect? && best_result != ActivityConstants::FREE_PLAY_RESULT
    self.best_result = new_result if best_result.nil? || new_result > best_result

    total_time_spent = calculate_total_time_spent(time_spent)
    self.time_spent = total_time_spent if total_time_spent

    assign_locale_data(locale) if locale

    atomic_save!
  end

  private def refresh_locale_supported
    self.locale_supported = resolved_unit&.supported_locale?(locale)
  end

  private def reset_best_result
    self.best_result = ActivityConstants::UNSUBMITTED_RESULT
  end
end
