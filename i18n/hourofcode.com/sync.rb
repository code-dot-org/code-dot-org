#! /usr/bin/env ruby

# `crowdin-cli upload sources`
# `crowdin-cli download`

# remove all metadata

Dir.glob("../../pegasus/sites.v3/hourofcode.com/public/us/**/*.md").gsub(/^.*\*\s\*\s\*/m, '')