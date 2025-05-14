require 'erb'
require 'yaml'
require 'json'
require 'date'
require 'fileutils'
require_relative '../../lib/cdo/cloud_formation/stack_template'

namespace :cfn do
  desc 'Flatten a CloudFormation ERB template into a consistent JSON form for diff-friendly comparisons. Usage: rake cfn:flatten[aws/cloudformation/foo.yml.erb]'
  task :flatten, [:template_path] do |_, args|
    template_path = args[:template_path] || abort("Please provide a template path: rake cfn:flatten[aws/cloudformation/iam.yml.erb]")
    output_dir    = 'aws/cloudformation/flattened-rendered-templates'
    basename      = File.basename(template_path, '.yml.erb')
    output_path   = File.join(output_dir, "#{basename}_flattened.json")

    # Render template with CloudFormation helpers (service_role, component, etc.)
    renderer = Cdo::CloudFormation::StackTemplate.new(filename: template_path, stack_name: 'flatten')
    rendered = renderer.render

    data = YAML.safe_load(rendered, permitted_classes: [Date], aliases: true)

    def flatten(obj)
      case obj
      when Hash
        obj.keys.sort.each_with_object({}) {|k, h| h[k] = flatten(obj[k])}
      when Array
        arr = obj.map {|e| flatten(e)}
        if arr.all?(String)
          arr.sort
        elsif arr.all? {|e| e.is_a?(Hash) && e.key?('Name')}
          arr.sort_by {|e| e['Name'].to_s}
        else
          arr.sort_by(&:to_s)
        end
      else
        obj
      end
    end

    flat = flatten(data)

    FileUtils.mkdir_p(output_dir)
    File.write(output_path, JSON.pretty_generate(flat))
    puts "Flattened output written to #{output_path}"
  end
end
