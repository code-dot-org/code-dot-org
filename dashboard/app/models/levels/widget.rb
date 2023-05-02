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

  # Determines the location of the widget template.
  #
  # This will negotiate templates even if the href does not explicitly specify
  # them. For instance, an href of 'pixelation.html' will use
  # 'pixelation.html.haml' if it exists.
  #
  # Otherwise, it will return the href intact. If this is an HTML file, it would
  # then have to be rendered inline.
  def template
    # Determine the template from the level and try to find it within the views
    # path for the application.
    href = properties['href']
    path = Rails.root.join('app', 'views', 'levels', File.basename(href))

    # Ensure we are looking for a 'haml' template, if it isn't already one.
    if File.extname(path)[1..] == "html"
      path = "#{path}.haml"
    end

    # Add an underscore, as it is expecting.
    path = File.join(File.dirname(path), "_" + File.basename(path))

    # If it exists, then the haml file should be preferred, so return it without
    # the underscore.
    if File.exist?(path)
      return "levels/" + File.basename(path)[1..]
    end

    # Otherwise, we assume the widget exists within the public path.
    Rails.root.join('public', href).to_s
  end

  # Determines the type of template being rendered for this widget.
  def template_type
    File.extname(template)[1..].to_sym
  end
end
