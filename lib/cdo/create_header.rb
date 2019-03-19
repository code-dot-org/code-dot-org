# This class provides the contents for the create projects
# dropdown in the header.

class CreateHeader
  PROJECT_INFO_OVERRIDES = {
    minecraft_designer: {
      id: "create_dropdown_minecraft",
      image: "logo_minecraft.png",
      title: "minecraft",
    },
    applab: {
      image: "logo_applab_square.png"
    },
    gamelab: {
      image: "logo_gamelab_square.png"
    }
  }.freeze

  # project info data can be inferred from the key, except when otherwise
  # specified
  def self.get_project_info(key)
    info = {
      id: "create_dropdown_#{key}",
      image: "logo_#{key}.png",
      title: key,
      url: CDO.studio_url("projects/#{key}/new"),
    }

    info.merge(PROJECT_INFO_OVERRIDES[key.to_sym] || {})
  end

  def self.get_create_dropdown_contents(options)
    everyone_entries = %w(spritelab artist)

    applab_gamelab = %w(applab gamelab)

    entries = options[:limit_project_types] == "true" ?
      everyone_entries + ["minecraft_designer"] :
      everyone_entries + applab_gamelab

    entries << "dance"

    entries.map(&method(:get_project_info))
  end
end
