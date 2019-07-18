require File.expand_path('../../../dashboard/config/environment', __FILE__)
require 'yaml'
require_relative 'i18n_script_utils'

old = YAML.load_file(Rails.root.join("../i18n/locales/source/dashboard/dsls.yml"))
new = YAML.load_file(Rails.root.join("config/locales/dsls.en.yml"))

both = old.deep_merge new

File.write("i18n/locales/source/dashboard/dsls.yml", to_crowdin_yaml(both))
