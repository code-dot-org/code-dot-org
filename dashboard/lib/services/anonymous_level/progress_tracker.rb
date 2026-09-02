# frozen_string_literal: true

module Services
  module AnonymousLevel
    class ProgressTracker < Services::Base
      attr_reader :anon_user_id, :script_id, :level_id, :new_result, :submitted, :unit_group_id, :level_source_id,
                  :is_navigator, :time_spent, :locale

      def initialize(
        anon_user_id:,
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
        @anon_user_id = anon_user_id
        @script_id    = script_id
        @level_id     = level_id

        @level_source_id = level_source_id
        @unit_group_id   = unit_group_id
        @new_result      = new_result
        @submitted       = submitted
        @is_navigator    = is_navigator
        @time_spent      = time_spent
        @locale          = locale
      end

      def call
        if DCDO.get('anonymous_level_tracking_enabled', false)
          Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
            anonymous_level_progress = ::AnonymousLevel::Progress.find_or_initialize_by(
              anon_user_id:,
              script_id:,
              level_id:,
            )

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
            namespace: 'anonymous_level',
            event: 'progress_tracking',
            anon_user_id:,
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
