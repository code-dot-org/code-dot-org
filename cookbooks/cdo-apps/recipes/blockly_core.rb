include_recipe 'cdo-java-7'
::Chef::Recipe.send(:include, CdoApps)
setup_build('blockly-core')
