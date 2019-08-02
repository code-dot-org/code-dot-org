#!/usr/bin/env ruby
require_relative '../config/environment'
require 'json'

redcarpet = {}
markdown = {}

scripts_to_skip = %w(
  2016_sciencePD-phase2b
  2016_sciencePD_phase1
  2016_sciencePD_phase2b
  AlgebraA
  CSF_Secret_Sample
  CSF_Secret_Sample_Story
  ECSPD
  ECSPD-NexTech
  ECSPD-iZone
  ECSPD1
  ECSPD2
  ECSPD2-NexTech
  ECSPD2-iZone
  ECSPD3-Unit2
  ECSPD3-Unit3
  ECSPD3-Unit4
  ECSPD3-Unit5
  ECSPD3-Unit6
  Equity-OnlinePD
  Test Wednesday
  algebra
  algebraFacilitator
  algebraPD
  algebraPD-NexTech
  algebraPD-iZone
  algebraPD1
  algebraPD2
  algebraPD2b
  algebraPD3
  algebraPD3a
  algebraPD3b
  algebraPD3c
  algebrapdnext
  allthehiddenthings
  alltheplcthings
  allthethings
  andrea-test
  coursea-draft
  courseb-draft
  coursec-draft
  coursed-draft
  coursee-draft
  coursef-draft
  csd1-old
  csd2-old
  csd3-1819draft
  csd3-old
  csd4-draft
  csd4-old
  csd5-draft
  csd5-old
  csd6-draft
  csd6-old
  csdgraveyard
  csp1-pilot-staging
  csp10-pilot-staging
  csp2-pilot-staging
  csp3-pilot-staging
  csp3-staging
  csp4-pilot-staging
  csp5-pilot-staging
  csp6-pilot-staging
  csp7-pilot-staging
  csp8-pilot-staging
  csp9-pilot-staging
  cspunit3temp
  cspunit4draft
  cspunit6draft
  science-PD2
  sciencePD
  sciencePD-NexTech
  sciencePD-iZone
  sciencePD1
  sciencePD2
  sciencePD2b
  sciencePD2b-iZone
  sciencePD3
  sciencePD3_pre1
  sciencepd3-2016
  sciencepd4
  sciencepd5
  test-teaching-ap-cs-unit-1
  workshop-gamelab
  workshop-maker
)

Level.all.each do |level|
  next unless level.is_a? DSLDefined
  next unless level.properties['markdown'].present?
  next unless level.script_levels.count > 0
  next if level.script_levels.map {|sl| sl.script.name}.all? {|script_name| scripts_to_skip.include? script_name}

  markdown[level.name] = level.properties['markdown']
  redcarpet[level.name] = ActionView::Base.new.render(inline: level.properties['markdown'], type: :md)
end

File.open("/tmp/markdown.json", "w") do |f|
  f.write(JSON.pretty_generate(markdown))
end

File.open("/tmp/redcarpet.json", "w") do |f|
  f.write(JSON.pretty_generate(redcarpet))
end
