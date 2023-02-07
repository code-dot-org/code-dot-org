#!/usr/bin/env ruby

require 'json'

# Probability table images are swapped if they match this regex
swapped_regex = %r{
  \|\s!\[\]\(.*image-1602689928157.png\)\s\|\s!\[\]\(.*image-1602689933087.png\)\s\|.*\|\n
  \|\s!\[\]\(.*image-1602689942798.png\)\s\|\s!\[\]\(.*image-1602689933087.png\)\s\|.*\|\n
  \|\s!\[\]\(.*image-1602689928157.png\)\s\|\s!\[\]\(.*image-1602689948477.png\)\s\|.*\|\n
  \|\s!\[\]\(.*image-1602689942798.png\)\s\|\s!\[\]\(.*image-1602689948477.png\)\s\|.*\|\n
}x

Dir['./dashboard/config/locales/long_instructions.*.json'].each do |path|
  puts "Checking: #{path}"
  locale = path.match(/long_instructions\.(.*-.*)\.json/).captures[0]

  file_json = JSON.parse(File.read(path))
  next if file_json.empty?

  probability_table = file_json[locale]['data']['long_instructions']['CourseF_outbreak6']
  next unless probability_table&.match(swapped_regex)

  # Swap purple masked monsters and purple unmaked monsters
  probability_table = probability_table.gsub('acb9359175b1de8319d6a1453b419aea-image-1602689928157', 'temp_purple')
  probability_table = probability_table.gsub('c1b4e6e8f10c6c31bbfb7c41146bfc81-image-1602689942798', 'acb9359175b1de8319d6a1453b419aea-image-1602689928157')
  probability_table = probability_table.gsub('temp_purple', 'c1b4e6e8f10c6c31bbfb7c41146bfc81-image-1602689942798')

  # Swap red masked monsters and red unmaked monsters
  probability_table = probability_table.gsub('2d5652abbe5351d343a8031849a6b15e-image-1602689933087', 'temp_red')
  probability_table = probability_table.gsub('8cc6854f2fc10e8211644a1f22955acc-image-1602689948477', '2d5652abbe5351d343a8031849a6b15e-image-1602689933087')
  probability_table = probability_table.gsub('temp_red', '8cc6854f2fc10e8211644a1f22955acc-image-1602689948477')

  # Write fixed probability table markdown to locale file
  file_json[locale]['data']['long_instructions']['CourseF_outbreak6'] = probability_table
  File.open(path, 'w') do |f|
    f.write(JSON.pretty_generate(file_json))
    puts "Fixed: #{path}"
  end
end

### Correct Images
# purple_mask:    https://images.code.org/acb9359175b1de8319d6a1453b419aea-image-1602689928157.png
# purple_no_mask: https://images.code.org/c1b4e6e8f10c6c31bbfb7c41146bfc81-image-1602689942798.png
# red_mask:       https://images.code.org/2d5652abbe5351d343a8031849a6b15e-image-1602689933087.png
# red_no_mask:    https://images.code.org/8cc6854f2fc10e8211644a1f22955acc-image-1602689948477.png
