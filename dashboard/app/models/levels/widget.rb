# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(4294967295)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#

class Widget < Level
  serialized_attrs %w(
    href
    skip_dialog
  )

  before_validation do
    self.skip_dialog = true
  end

  def widget_app_options
    # Base options are just the level properties
    app_options = properties.camelize_keys

    # Some options should be localized
    if should_localize?
      [:long_instructions, :short_instructions].each do |key|
        localized =
          I18n.t(
            name,
            scope: [:data, key],
            default: nil,
            smart: true
          )

        # Will set longInstructions and shortInstructions, if localized
        app_options[key.to_s.camelize(:lower)] = localized if localized
      end
    end

    return app_options
  end
end
