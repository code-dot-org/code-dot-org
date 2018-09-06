require_relative 'image_mod_data_set_prep'

thumbnail_urls = ImageModerationSampleDataSet.make_thumbnails_arrays

Then (/^I generate inappropriate App Lab projects from the data set$/) do
  thumbnail_urls[:inappropriate].each do |thumbnail_url|
    steps %Q{
      Then I make an App Lab project named "Image Moderation - Naughty" with thumbnail "#{thumbnail_url}"
    }
  end
end

Then (/^I generate appropriate App Lab projects from the data set$/) do
  thumbnail_urls[:appropriate].each do |thumbnail_url|
    steps %Q{
      Then I make an App Lab project named "Image Moderation - Safe" with thumbnail "#{thumbnail_url}"
    }
  end
end
