require 'erb'
require 'yaml'
require 'json'
require 'date'
require 'fileutils'
require 'digest'
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

    # Compute old fingerprint and line count if file exists
    old_md5   = File.exist?(output_path) ? Digest::MD5.file(output_path).hexdigest : nil
    old_lines = File.exist?(output_path) ? File.read(output_path).lines.count : nil

    FileUtils.mkdir_p(output_dir)
    File.write(output_path, JSON.pretty_generate(flat))
    puts "Flattened output written to #{output_path}"

    # Compute new fingerprint and line count
    new_md5   = Digest::MD5.file(output_path).hexdigest
    new_lines = File.read(output_path).lines.count

    if old_md5
      if new_md5 == old_md5
        puts "No changes detected: MD5 and line count unchanged (#{new_md5}, #{new_lines} lines)"
      else
        puts "Flattened file changed: MD5 #{old_md5} → #{new_md5}, lines #{old_lines} → #{new_lines}"
        puts "Run: git diff -- #{output_path}"
      end
    else
      puts "Created flattened file #{output_path} with MD5 #{new_md5}, #{new_lines} lines"
    end
  end
end
