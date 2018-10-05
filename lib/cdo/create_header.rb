# This class provides the contents for the create projects
# dropdown in the header.

class CreateHeader
  def self.get_create_dropdown_contents(options)
    everyone_entries = [
      {
        id: "create_dropdown_playlab",
        title: I18n.t("nav.create_button.playlab"),
        url: CDO.studio_url('projects/playlab/new'),
        image: "/shared/images/fill-70x70/courses/logo_playlab.png"
      },
      {
        id: "create_dropdown_artist",
        title: I18n.t("nav.create_button.artist"),
        url: CDO.studio_url('projects/artist/new'),
        image: "/shared/images/fill-70x70/courses/logo_artist.png"
      },
    ]

    younger_than_13_entries = [
      {
        id: "create_dropdown_flappy",
        title: I18n.t("nav.create_button.flappy"),
        url: CDO.studio_url('projects/flappy/new'),
        image: "/shared/images/fill-70x70/courses/logo_flappy.png"
      },
      {
        id: "create_dropdown_minecraft",
        title: I18n.t("nav.create_button.minecraft"),
        url: CDO.studio_url('projects/minecraft_designer/new'),
        image: "/shared/images/fill-70x70/courses/logo_minecraft.png"
      },
    ]

    older_than_13_entries = [
      {
        id: "create_dropdown_applab",
        title: I18n.t("nav.create_button.applab"),
        url: CDO.studio_url('projects/applab/new'),
        image: "/shared/images/fill-70x70/courses/logo_applab_square.png"
      },
      {
        id: "create_dropdown_gamelab",
        title: I18n.t("nav.create_button.gamelab"),
        url: CDO.studio_url('projects/gamelab/new'),
        image: "/shared/images/fill-70x70/courses/logo_gamelab_square.png"
      },
    ]

    entries = options[:user_under_13] ?
      everyone_entries + younger_than_13_entries :
      everyone_entries + older_than_13_entries

    entries
  end
end
