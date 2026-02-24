#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

SCRIPT_NAMES = %w[
  csp-create-2017
  csp-create-2018
  csp-explore-2017
  csp-explore-2018
  csp-post-survey
  csp-post-survey-2018
  csp1-2017
  csp1-2018
  csp2-2017
  csp2-2018
  csp3-2017
  csp3-2018
  csp4-2017
  csp4-2018
  csp5-2017
  csp5-2018
  csppostap-2017
  csppostap-2018
  cspunit1
  cspunit2
  cspunit3
  cspunit4
  cspunit5
  cspunit6
  csp6
  cspoptional
  csp3-research-mxghyt
  csp-ap
]

def main
  SCRIPT_NAMES.each do |name|
    script = Unit.find_by(name: name)

    unless script
      puts "Script with name #{name} not found"
      next
    end

    script.is_deprecated = true
    script.save!
    script.write_script_json
  end
end

main
