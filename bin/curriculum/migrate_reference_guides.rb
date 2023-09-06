#!/usr/bin/env ruby

require_relative '../../deployment'
raise unless [:development, :adhoc, :levelbuilder].include? rack_env

# this script will, for a given course version, update all instances of old format links to concept maps to
# reference guide links associated with that course version.
# Links looking like /docs/concepts/patterns/update-screen-pattern/
# will change to /courses/csp-2022/guides/update-screen-pattern/
# This will affect the following places:
#  Help and Tips tab: 'map_reference' and 'reference_links' fields
#  Map levels: 'reference' field in properties

COURSE_NAME = ARGV[0].freeze

$verbose = false
def log(str)
  puts str if $verbose
end

$quiet = false
def warn(str)
  puts str unless $quiet && !$verbose
end

# Wait until after initial error checking before loading the rails environment.
def require_rails_env
  log "loading rails environment..."
  start_time = Time.now
  require_relative '../../dashboard/config/environment'
  log "rails environment loaded in #{(Time.now - start_time).to_i} seconds."
end

require_rails_env

# get course version and associated levels from either a unit group or standalone script
def find_matching_course_version_and_levels(course_name)
  matching_unit_group = UnitGroup.find_by_name(course_name)
  # if we need to handle pilots, add alternate_unit_groups
  return [matching_unit_group.course_version.id, matching_unit_group.default_units.flat_map(&:all_descendant_levels)] if matching_unit_group
  matching_standalone_course = Unit.find_by_name(course_name)
  return [matching_standalone_course.get_course_version.id, matching_standalone_course.all_descendant_levels] if matching_standalone_course
  return [nil, nil]
end

# course_name: 'csp-2022'
def migrate_course_reference_guides(course_name)
  course_version_id, levels = find_matching_course_version_and_levels(course_name)

  levels.each do |level|
    # help and tips
    level.properties['map_reference'] = convert_concept_map_url_to_ref_guide_url(level.properties['map_reference'], course_name, course_version_id) if level.properties['map_reference']
    level.properties['reference_links'] = level.properties['reference_links'].map {|link| convert_concept_map_url_to_ref_guide_url(link, course_name, course_version_id)} if level.properties['reference_links']

    # map levels
    old_url = level.properties['reference']
    if old_url && level.type == 'Map'
      level.properties['reference'] = convert_concept_map_url_to_ref_guide_url(old_url, course_name, course_version_id)
    end
    level.save!
  end
end

def unmigrate_course_reference_guides(course_name)
  course_version_id, levels = find_matching_course_version_and_levels(course_name)

  levels.each do |level|
    # help and tips
    level.properties['map_reference'] = convert_ref_guide_url_to_concept_map_url(level.properties['map_reference'], course_version_id) if level.properties['map_reference']
    level.properties['reference_links'] = level.properties['reference_links'].map {|link| convert_ref_guide_url_to_concept_map_url(link, course_version_id)} if level.properties['reference_links']

    # map levels
    old_url = level.properties['reference']
    if old_url && level.type == 'Map'
      level.properties['reference'] = convert_ref_guide_url_to_concept_map_url(old_url, course_version_id)
    end
    level.save!
  end
end

# needs to match logic in import script for renaming duplicate entries
def convert_concept_map_url_to_ref_guide_url(url, course_name, course_version_id)
  url.strip!
  return url unless url&.start_with? '/docs/concepts'
  # match the category keys without docs/concepts or index.html at the end
  match = /^\/docs\/concepts\/(.+\/)+(index\.html)?/.match(url)
  keys = match[1].split('/')

  # search keys within children of each category
  # search just the front part of the key so that we match keys that might have
  # turned into key-2, key-3, etc due to deduplication (right now there's no duplication between siblings)
  final_key = keys.reduce(nil) do |last_parent, key|
    result = ReferenceGuide.
             where(course_version_id: course_version_id, parent_reference_guide_key: last_parent).
             where("reference_guides.key LIKE ?", "#{key}%").first
    puts "no guide found for #{last_parent}, #{key}" unless result
    result.key
  end
  new_url = "/courses/#{course_name}/guides/#{final_key}"
  puts "#{url} converted to #{new_url}"
  new_url
end

# doesn't perfectly unconvert, can't tell if there's an index.html at the end
def convert_ref_guide_url_to_concept_map_url(url, course_version_id)
  return url unless url&.start_with? '/courses'
  key = /^\/courses\/.+\/guides\/(.+)/.match(url)[1]
  path = [key.partition(/-\d/)[0]]
  parent_key = ReferenceGuide.find_by(course_version_id: course_version_id, key: key).parent_reference_guide_key
  until parent_key.nil?
    path.unshift(parent_key)
    parent_key = ReferenceGuide.find_by(course_version_id: course_version_id, key: parent_key).parent_reference_guide_key
  end
  new_url = "/docs/concepts/#{path.join('/')}/"
  puts "#{url} converted to #{new_url}"
  new_url
end

# some samples of possible values in the wild
# only the first format exists in 2021/2022 year levels
# though the instructions on the levelbuilder editor page still say to include the index.html
$test_urls = [
  '/docs/concepts/patterns/update-screen-pattern/',
  '/docs/concepts/javascript/if-statements/index.html',
  '/docs/concepts/app-lab/if-statements/',
  '/docs/csd/the-accelerometer/',
  '/docs/applab/checkbox/index.html',
  '/docs/concepts/other/creative-commons-search/index.html',
  '/docs/concepts/game-lab/sprites/sprite-properties/',
  '/docs/concepts/game-lab/animation-tab/editing-images/',
  '/docs/concepts/app-lab/design-mode/',
  '/docs/concepts/app-lab/design-mode/design-mode-elements/',
  'https://curriculum.code.org/docs/concepts/ai-lab/using-data-with-categorical-features/',
  'https://docs.google.com/document/d/e/2PACX-1vSbu1JcuqFt8sFJWEUsd2dMmvRhzkNMD30gPiMpFYNZJEPEOzflNVGWqEL36VjpDKVcYY2NDyVi4gZl/pub'
]

def test_convert
  expect = [
    '/courses/csp-2022/guides/update-screen-pattern',
    '/courses/csp-2022/guides/if-statements',
    '/courses/csp-2022/guides/if-statements-2',
    '/docs/csd/the-accelerometer/',
    '/docs/applab/checkbox/index.html',
    '/courses/csp-2022/guides/creative-commons-search',
    '/courses/csp-2022/guides/sprite-properties',
    '/courses/csp-2022/guides/editing-images',
    '/courses/csp-2022/guides/design-mode',
    '/courses/csp-2022/guides/design-mode-elements',
    'https://curriculum.code.org/docs/concepts/ai-lab/using-data-with-categorical-features/',
    'https://docs.google.com/document/d/e/2PACX-1vSbu1JcuqFt8sFJWEUsd2dMmvRhzkNMD30gPiMpFYNZJEPEOzflNVGWqEL36VjpDKVcYY2NDyVi4gZl/pub'
  ]

  course_version_id = UnitGroup.find_by_name('csp-2021').course_version.id
  $test_urls.zip(expect).each do |(url, expected)|
    new_url = convert_concept_map_url_to_ref_guide_url(url, 'csp-2022', course_version_id)
    check = new_url == expected
    puts "#{check} #{new_url}"
    puts "expected #{expected}" unless check
  end
end

#test_unconvert

def test_unconvert
  urls = [
    '/courses/csp-2022/guides/update-screen-pattern',
    '/courses/csp-2022/guides/if-statements',
    '/courses/csp-2022/guides/if-statements-2',
    '/courses/csp-2022/guides/creative-commons-search',
    '/courses/csp-2022/guides/sprite-properties',
    '/courses/csp-2022/guides/editing-images',
    '/courses/csp-2022/guides/design-mode',
    '/courses/csp-2022/guides/design-mode-elements',
  ]
  expect = [
    '/docs/concepts/patterns/update-screen-pattern/',
    '/docs/concepts/javascript/if-statements/',
    '/docs/concepts/app-lab/if-statements/',
    '/docs/concepts/other/creative-commons-search/',
    '/docs/concepts/game-lab/sprites/sprite-properties/',
    '/docs/concepts/game-lab/animation-tab/editing-images/',
    '/docs/concepts/app-lab/design-mode/',
    '/docs/concepts/app-lab/design-mode/design-mode-elements/',
  ]

  course_version_id = UnitGroup.find_by_name('csp-2021').course_version.id
  urls.zip(expect).each do |(url, expected)|
    new_url = convert_ref_guide_url_to_concept_map_url(url, course_version_id)
    check = new_url == expected
    puts "#{check} #{new_url}"
    puts "expected #{expected}" unless check
  end
end

#test_unconvert

def test_regex
  regex = /^\/docs\/concepts\/(.+\/)+(index\.html)?/

  expect = [
    'patterns/update-screen-pattern/',
    'javascript/if-statements/',
    'app-lab/if-statements/',
    nil,
    nil,
    'other/creative-commons-search/',
    'game-lab/sprites/sprite-properties/',
    'game-lab/animation-tab/editing-images/',
    'app-lab/design-mode/',
    'app-lab/design-mode/design-mode-elements/',
    nil,
    nil
  ]

  $test_urls.zip(expect).each do |(url, expected)|
    match = regex.match(url)
    check = (match && match[1]) == expected
    puts "#{check} #{match}"
  end
end

#test_regex

migrate_course_reference_guides COURSE_NAME
