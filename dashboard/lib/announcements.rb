class Announcements
  @@announcements_data = nil
  @@loaded = false
  @@load_error = false
  @@json_path = dashboard_dir 'config/marketing/announcements.json'

  # enables unit tests
  def self.set_file_path(path)
    @@json_path = path
    @@loaded = false
    @@load_error = false
  end

  # gets special announcement data for a page, or nil if not found
  def self.get_announcement_for_page(page)
    load_announcements
    return nil if @@load_error || !@@announcements_data
    pages = @@announcements_data[:pages]
    banners = @@announcements_data[:banners]
    banner_id_for_page = pages[page]
    return nil unless banner_id_for_page

    banner = banners[banner_id_for_page]

    #Returns banner if no DCDO property or if DCDO property is present and set to true
    unless banner && banner["dcdo"] && !DCDO.get(banner["dcdo"], false)
      banner&.merge({id: banner_id_for_page})
    end
  end

  # gets localized special announcement data for a page, or nil if not found
  def self.get_localized_announcement_for_page(page)
    announcement = get_announcement_for_page(page)
    return nil unless announcement

    announcement_scope = [:data, :marketing_announcements, :banners, announcement[:id]]
    localized_fields = {
      title: localize_property("title", announcement['title'], announcement_scope),
      body: localize_property("body", announcement['body'], announcement_scope),
      buttonText: localize_property("buttonText", announcement['buttonText'], announcement_scope),
    }
    announcement.merge(localized_fields)
  end

  def self.localize_property(property_name, default, scope)
    I18n.t(
      property_name,
      default: default,
      scope: scope,
      smart: true
    )
  end

  def self.load_announcements
    # Reloads JSON file with announcement data on each page load
    # in non-production environments
    unless (@@load_error || @@loaded) && Rails.env.production?
      unless File.file?(@@json_path)
        @@load_error = true
        return
      end
      begin
        @@announcements_data = JSON.parse(
          File.read(@@json_path),
          symbolize_names: true,
          object_class: HashWithIndifferentAccess
        )
        unless validate_announcements_data(@@announcements_data)
          @@load_error = true
        end
      rescue JSON::ParserError
        @@load_error = true
      end
      @@loaded = true
    end
  end

  def self.validate_announcements_data(announcements_data)
    return false unless announcements_data && announcements_data[:pages] &&
      announcements_data[:banners] &&
      announcements_data[:banners].respond_to?(:each_value)

    announcements_data[:banners].each_value do |banner|
      return false unless validate_banner(banner)
    end
    return true
  end

  # validate a banner has the required fields
  def self.validate_banner(banner)
    banner[:image] && banner[:title] && banner[:body] && banner[:buttonText] && banner[:buttonUrl]
  end
end
