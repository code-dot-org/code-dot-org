# This class provides the contents for the create projects
# dropdown in the header.

class CreateHeader
  def self.get_create_dropdown_contents(options)
    everyone_entries = [
      {
        id: "create_dropdown_spritelab",
        title: "spritelab",
        url: CDO.studio_url('projects/spritelab/new'),
        image: "logo_spritelab.png"
      },
      {
        id: "create_dropdown_artist",
        title: "artist",
        url: CDO.studio_url('projects/artist/new'),
        image: "logo_artist.png"
      },
    ]

    minecraft = [
      {
        id: "create_dropdown_minecraft",
        title: "minecraft",
        url: CDO.studio_url('projects/minecraft_designer/new'),
        image: "logo_minecraft.png"
      },
    ]

    applab_gamelab = [
      {
        id: "create_dropdown_applab",
        title: "applab",
        url: CDO.studio_url('projects/applab/new'),
        image: "logo_applab_square.png"
      },
      {
        id: "create_dropdown_gamelab",
        title: "gamelab",
        url: CDO.studio_url('projects/gamelab/new'),
        image: "logo_gamelab_square.png"
      },
    ]

    dance_party = [
      {
        id: "create_dropdown_dance",
        title: "dance",
        url: CDO.studio_url('projects/dance/new'),
        image: "logo_dance.png"
      }
    ]

    entries = options[:limit_project_types] == "true" ?
      everyone_entries + minecraft :
      everyone_entries + applab_gamelab

    entries += dance_party

    entries
  end
end
