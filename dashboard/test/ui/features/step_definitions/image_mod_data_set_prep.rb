module ImageModerationSampleDataSet
  def self.make_thumbnails_arrays
    @inappropriate_thumbnail_urls = []
    @appropriate_thumbnail_urls = []
    File.open("image_mod_data_set.txt").each do |line|
      thumbnail_url = line.split(',')[0].split(':')[1] + line.split(',')[0].split(':')[2].gsub(/\A"|"\z/, '')
      category = line.split(',')[2].split(':')[1].gsub(/"|\[|\]/, '').delete('}')
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
