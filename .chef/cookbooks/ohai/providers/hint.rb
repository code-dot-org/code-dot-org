def why_run_supported?
  true
end

def ohai_hint_path
  ::File.join(node['ohai']['hints_path'], "#{new_resource.name}.json")
end

def build_content
  # passing nil to file produces deprecation warnings so pass an empty string
  return '' if new_resource.content.nil? || new_resource.content.empty?
  JSON.pretty_generate(new_resource.content)
end

use_inline_resources

action :create do
  # don't create the file if the existing file was empty and so is the new one
  # this avoids bogus content updates on every chef run
  unless (@current_resource.content && @current_resource.content.empty?) && new_resource.content.nil?
    directory node['ohai']['hints_path'] do
      action :create
      recursive true
    end

    file ohai_hint_path do
      action :create
      content build_content
    end
  end
end

def load_current_resource
  @current_resource = Chef::Resource::OhaiHint.new(new_resource.name)
  if ::File.exist?(ohai_hint_path)
    Chef::Log.debug("Existing ohai hint at #{ohai_hint_path} found. Attempting to parse JSON")
    begin
      @current_resource.content(JSON.parse(::File.read(ohai_hint_path)))
    rescue JSON::ParserError
      @current_resource.content({})
      Chef::Log.debug("Could not parse JSON in ohai hint at #{ohai_hint_path}. It's probably an empty hint file")
    end
  end

  @current_resource
end
