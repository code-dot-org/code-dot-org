# This class provides the contents for the create projects
# dropdown in the header.

class CreateHeader
  PROJECT_INFO_OVERRIDES = {
    minecraft_designer: {
      id: "create_dropdown_minecraft",
      image: "logo_minecraft.png",
    },
    minecraft_adventurer: {
      image: "logo_mc.png",
    },
    minecraft_hero: {
      image: "logo_minecraft_hero_square.jpg"
    },
    minecraft_aquatic: {
      image: "logo_minecraft_aquatic_square.jpg"
    },
    applab: {
      image: "logo_applab_square.png"
    },
    gamelab: {
      image: "logo_gamelab_square.png"
    },
    playlab_k1: {
      image: "logo_playlab.png"
    },
    artist_k1: {
      image: "logo_artist.png"
    },
    poetry_hoc: {
      image: "logo_poetry.png"
    },
    music: {
      url: CDO.studio_url("/s/music-intro-2024/reset")
    },
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
    entries << "music"

    if options[:project_type] && !(entries.include? options[:project_type])
      entries.unshift(options[:project_type])
    end

    entries.map {|entry| get_project_info(entry)}
  end
end
