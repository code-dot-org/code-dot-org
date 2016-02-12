#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'

# ALL U.S. code studio + HOC teachers
generate('us-teacher')

# ALL U.S. petition signers minus the above
generate('us-petition')
