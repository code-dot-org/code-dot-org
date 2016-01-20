#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'

# 2015 organizers (kind_s:HocSignup2015)
generate('hoc-organizers')

# All the rest
generate('all')
