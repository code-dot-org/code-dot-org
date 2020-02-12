#!/usr/bin/env ruby
require_relative '../../../deployment'
require 'cdo/only_one'
require 'pa11y'

urls = ['studio.code.org']

pa11y_path = ""

def main
end

main if only_one_running?(__FILE__)
