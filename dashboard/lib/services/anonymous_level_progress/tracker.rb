# frozen_string_literal: true

module Services
  module AnonymousLevelProgress
    class Tracker < Services::Base
      attr_reader :stable_id, :script_id, :level_id, :new_result, :submitted, :unit_group_id, :level_source_id,
                  :is_navigator, :time_spent, :locale

      def initialize(
        stable_id:,
        script_id:,
        level_id:,
        submitted:,
        new_result:,
        unit_group_id: nil,
        level_source_id: nil,
        is_navigator: false,
        time_spent: nil,
        locale: nil
      )
        @stable_id = stable_id
        @script_id = script_id
        @level_id  = level_id

        @level_source_id = level_source_id
        @unit_group_id   = unit_group_id
        @new_result      = new_result
        @submitted       = submitted
        @is_navigator    = is_navigator
        @time_spent      = time_spent
        @locale          = locale
      end

      def call
        if DCDO.get('anonymous_level_progress_tracking_enabled', false)
          Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
            anonymous_level_progress = ::AnonymousLevelProgress.find_or_initialize_by(stable_id:, script_id:, level_id:)

            anonymous_level_progress.update_progress!(
              new_result:,
              submitted:,
              unit_group_id:,
              level_source_id:,
              is_navigator:,
              time_spent:,
              locale:
            )
          end
        else
          CDO.log.info JSON.dump(
            namespace: 'anonymous_level_progress',
            event: 'tracking',
            stable_id:,
            script_id:,
            level_id:,
            unit_group_id:,
            level_source_id:,
            submitted:,
            new_result:,
            is_navigator:,
            time_spent:,
            locale:,
          )
        end
      end
    end
  end
end
