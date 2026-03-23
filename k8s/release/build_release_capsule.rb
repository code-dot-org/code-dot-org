#!/usr/bin/env ruby

require 'fileutils'
require 'json'
require 'optparse'
require 'time'
require 'yaml'

module ReleaseCapsule
  module_function def run!(argv)
    options = parse_options(argv)
    validate_options!(options)

    output_dir = File.expand_path(options.fetch(:output_dir))
    FileUtils.rm_rf(output_dir)
    FileUtils.mkdir_p(output_dir)

    package_dir = File.join(output_dir, 'package', 'kustomize')
    FileUtils.mkdir_p(package_dir)
    copy_tree(File.join(options.fetch(:repo_root), 'k8s', 'kustomize', 'base'), File.join(package_dir, 'base'))
    copy_tree(File.join(options.fetch(:repo_root), 'k8s', 'kustomize', 'components'), File.join(package_dir, 'components'))

    metadata_dir = File.join(output_dir, 'metadata')
    FileUtils.mkdir_p(metadata_dir)

    release = build_release(options)
    File.write(File.join(output_dir, 'release.yaml'), release.to_yaml(line_width: -1))
    File.write(File.join(metadata_dir, 'provenance.json'), JSON.pretty_generate(build_provenance(options)))
    File.write(File.join(metadata_dir, 'sbom.json'), JSON.pretty_generate(build_sbom(options)))
  end

  module_function def parse_options(argv)
    options = {
      repo_root: File.expand_path('../..', __dir__),
      schema_version: 'codeai/v1alpha1',
      package_kind: 'kustomize',
      package_path: 'package/kustomize',
      sbom_path: 'metadata/sbom.json',
      provenance_path: 'metadata/provenance.json'
    }

    parser = OptionParser.new do |opts|
      opts.banner = 'Usage: build_release_capsule.rb --commit-sha <sha> --image-repo <repo> --image-tag <tag> --image-digest <digest> --output-dir <dir>'

      opts.on('--repo-root PATH') {|value| options[:repo_root] = File.expand_path(value)}
      opts.on('--commit-sha SHA') {|value| options[:commit_sha] = value}
      opts.on('--image-repo REPO') {|value| options[:image_repo] = value}
      opts.on('--image-tag TAG') {|value| options[:image_tag] = value}
      opts.on('--image-digest DIGEST') {|value| options[:image_digest] = value}
      opts.on('--capsule-repo REPO') {|value| options[:capsule_repo] = value}
      opts.on('--output-dir PATH') {|value| options[:output_dir] = value}
      opts.on('--build-time RFC3339') {|value| options[:build_time] = value}
      opts.on('--source-repo-url URL') {|value| options[:source_repo_url] = value}
      opts.on('--workflow-name NAME') {|value| options[:workflow_name] = value}
      opts.on('--workflow-run-url URL') {|value| options[:workflow_run_url] = value}
      opts.on('--workflow-ref REF') {|value| options[:workflow_ref] = value}
    end

    parser.parse!(argv)
    options
  end

  module_function def validate_options!(options)
    %i[commit_sha image_repo image_tag image_digest output_dir].each do |key|
      value = options[key]
      raise ArgumentError, "missing required option #{key}" if value.nil? || value.empty?
    end

    unless options[:commit_sha].match?(/\A[0-9a-f]{40}\z/)
      raise ArgumentError, "commit sha must be a full 40-char lowercase hex sha: #{options[:commit_sha]}"
    end

    expected_tag = "git-#{options[:commit_sha]}"
    unless options[:image_tag] == expected_tag
      raise ArgumentError, "image tag #{options[:image_tag]} does not match expected #{expected_tag}"
    end

    unless options[:image_digest].match?(/\Asha256:[0-9a-f]{64}\z/)
      raise ArgumentError, "image digest must be a sha256 digest: #{options[:image_digest]}"
    end
  end

  module_function def copy_tree(source, destination)
    raise ArgumentError, "missing source tree #{source}" unless Dir.exist?(source)

    FileUtils.mkdir_p(File.dirname(destination))
    FileUtils.cp_r(source, destination)
  end

  module_function def build_release(options)
    {
      'schemaVersion' => options.fetch(:schema_version),
      'gitCommit' => options.fetch(:commit_sha),
      'image' => {
        'repoURL' => options.fetch(:image_repo),
        'tag' => options.fetch(:image_tag),
        'digest' => options.fetch(:image_digest)
      },
      'package' => {
        'kind' => options.fetch(:package_kind),
        'path' => options.fetch(:package_path)
      },
      'metadata' => {
        'sbomPath' => options.fetch(:sbom_path),
        'provenancePath' => options.fetch(:provenance_path)
      }
    }
  end

  module_function def build_provenance(options)
    {
      'schemaVersion' => 'codeai-release-provenance/v1alpha1',
      'buildTime' => build_time(options),
      'source' => {
        'repository' => options[:source_repo_url],
        'commit' => options.fetch(:commit_sha),
        'ref' => options[:workflow_ref]
      },
      'workflow' => {
        'name' => options[:workflow_name],
        'runURL' => options[:workflow_run_url]
      },
      'release' => {
        'image' => {
          'repoURL' => options.fetch(:image_repo),
          'tag' => options.fetch(:image_tag),
          'digest' => options.fetch(:image_digest)
        },
        'capsule' => {
          'repoURL' => options[:capsule_repo],
          'tag' => options.fetch(:image_tag)
        }
      }
    }.compact
  end

  module_function def build_sbom(options)
    {
      'schemaVersion' => 'codeai-release-sbom/v1alpha1',
      'generatedAt' => build_time(options),
      'subject' => {
        'image' => {
          'repoURL' => options.fetch(:image_repo),
          'tag' => options.fetch(:image_tag),
          'digest' => options.fetch(:image_digest)
        }
      },
      'note' => 'Release capsule metadata placeholder. Replace with a richer SBOM generator when the image SBOM pipeline is available.'
    }
  end

  module_function def build_time(options)
    Time.parse(options[:build_time] || Time.now.utc.iso8601).utc.iso8601
  end
end

ReleaseCapsule.run!(ARGV)
