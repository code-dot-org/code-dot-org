module ImageModerationSampleDataSet
  def self.make_thumbnails_arrays
    @inappropriate_thumbnail_urls = []
    @appropriate_thumbnail_urls = []
    File.open(dashboard_dir("test/ui/features/step_definitions/image_mod_data_set.txt")).each do |line|
      parsed_line = JSON.parse(line)
      thumbnail_url = parsed_line["content"]
      category = parsed_line["annotation"]["labels"].first
      if category == "Nude"
        @inappropriate_thumbnail_urls.push(thumbnail_url)
      elsif category == "NonNude"
        @appropriate_thumbnail_urls.push(thumbnail_url)
      end
    end
    @image_mod_data_set_thumbnail_urls = {
      inappropriate: @inappropriate_thumbnail_urls,
      appropriate: @appropriate_thumbnail_urls
    }
  end
end
