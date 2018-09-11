require_relative 'image_mod_data_set_prep'
require_relative '../../../../../deployment'

THUMBNAIL_URLS = ImageModerationSampleDataSet.make_thumbnails_arrays

Then (/^I generate inappropriate App Lab projects from the data set$/) do
  THUMBNAIL_URLS[:inappropriate].each_with_index do |thumbnail_url|
    steps %Q{
      Then I make an App Lab project named "Image Mod - Bad #{index}" with thumbnail "#{thumbnail_url}"
    }
  end
end

Then (/^I generate appropriate App Lab projects from the data set$/) do
  THUMBNAIL_URLS[:appropriate].each_with_index do |thumbnail_url, index|
    steps %Q{
      Then I make an App Lab project named "Image Mod - Safe #{index}" with thumbnail "#{thumbnail_url}"
    }
  end
end
