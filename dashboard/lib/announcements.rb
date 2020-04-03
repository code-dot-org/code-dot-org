class Announcements
  @@announcements_data = nil
  @@loaded = false
  @@load_error = false
  @@json_path = pegasus_dir 'sites.v3/code.org/announcements.json'

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
    return nil unless pages[page]

    banner = banners[pages[page]]
    banner ? banner : nil
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
          IO.read(@@json_path),
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
      announcements_data[:banners].respond_to?("each_value")

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
