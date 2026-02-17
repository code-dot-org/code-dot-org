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
#  index_levels_on_type       (type)
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

  # Identify the ActionView template associated with this level type. Currently
  # only Pixelation levels have such a template; all others will have to fall
  # back to `inline_template`.
  def partial_template
    File.join('levels', game.app)
  end

  # Identify the static HTML/HAML file associated with this level. Note that
  # despite us in theory allowing each individual level to specify a custom
  # href, in practice each model assigns a static value in a
  # `before_validation` block based on the specific type of level.
  #
  # TODO: update this logic so that all levels of a given type work the same,
  # rather than supporting per-level customization. Or just update all level
  # types to use `partial_template` instead, at which point we can remove both
  # this method and the `href` property.
  def inline_template
    File.read(Rails.root.join('public', properties['href']))
  end
end
