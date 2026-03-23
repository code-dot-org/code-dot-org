#!/usr/bin/env ruby

require 'fileutils'
require 'open3'
require 'optparse'
require 'tmpdir'
require 'yaml'

module ReleaseCapsuleContract
  REQUIRED_RELEASE_FIELDS = [
    ['gitCommit'],
    ['image', 'repoURL'],
    ['image', 'tag'],
    ['image', 'digest'],
    ['package', 'kind'],
    ['package', 'path'],
    ['metadata', 'sbomPath'],
    ['metadata', 'provenancePath']
  ].freeze

  module_function def run!(argv)
    options = parse_options(argv)
    release = YAML.load_file(File.join(options.fetch(:capsule_dir), 'release.yaml'))
    validate_release!(release, options)
    validate_paths!(release, options)
    %w[staging test levelbuilder production].each do |deployment|
      validate_render!(deployment, release, options)
    end
  end

  module_function def parse_options(argv)
    options = {}

    parser = OptionParser.new do |opts|
      opts.banner = 'Usage: verify_release_capsule_contract.rb --capsule-dir <dir> --gitops-root <dir> --image-repo <repo> --image-tag <tag> --image-digest <digest>'

      opts.on('--capsule-dir PATH') {|value| options[:capsule_dir] = File.expand_path(value)}
      opts.on('--gitops-root PATH') {|value| options[:gitops_root] = File.expand_path(value)}
      opts.on('--image-repo REPO') {|value| options[:image_repo] = value}
      opts.on('--image-tag TAG') {|value| options[:image_tag] = value}
      opts.on('--image-digest DIGEST') {|value| options[:image_digest] = value}
    end

    parser.parse!(argv)

    %i[capsule_dir gitops_root image_repo image_tag image_digest].each do |key|
      raise ArgumentError, "missing required option #{key}" if options[key].nil? || options[key].empty?
    end

    options
  end

  module_function def validate_release!(release, options)
    REQUIRED_RELEASE_FIELDS.each do |path|
      value = path.reduce(release) {|memo, key| memo.is_a?(Hash) ? memo[key] : nil}
      raise "release.yaml missing #{path.join('.')}" if value.nil? || value == ''
    end

    expected_commit = options.fetch(:image_tag).delete_prefix('git-')
    raise "gitCommit mismatch: #{release['gitCommit']} != #{expected_commit}" unless release['gitCommit'] == expected_commit
    raise "image repo mismatch" unless release.dig('image', 'repoURL') == options.fetch(:image_repo)
    raise "image tag mismatch" unless release.dig('image', 'tag') == options.fetch(:image_tag)
    raise "image digest mismatch" unless release.dig('image', 'digest') == options.fetch(:image_digest)
    raise "package kind mismatch" unless release.dig('package', 'kind') == 'kustomize'
    raise "package path must stay under package/" unless release.dig('package', 'path').start_with?('package/')
  end

  module_function def validate_paths!(release, options)
    capsule_dir = options.fetch(:capsule_dir)
    package_dir = File.join(capsule_dir, release.dig('package', 'path'))
    sbom_path = File.join(capsule_dir, release.dig('metadata', 'sbomPath'))
    provenance_path = File.join(capsule_dir, release.dig('metadata', 'provenancePath'))

    raise "missing package path #{package_dir}" unless File.exist?(File.join(package_dir, 'base', 'kustomization.yaml'))
    raise "missing components dir #{File.join(package_dir, 'components')}" unless Dir.exist?(File.join(package_dir, 'components'))
    raise "missing SBOM #{sbom_path}" unless File.file?(sbom_path)
    raise "missing provenance #{provenance_path}" unless File.file?(provenance_path)
  end

  module_function def validate_render!(deployment, release, options)
    gitops_root = options.fetch(:gitops_root)
    deployment_meta = YAML.load_file(File.join(gitops_root, 'apps', 'codeai', 'deployments', deployment, 'deployment.yaml'))
    env_type = deployment_meta.fetch('envType')
    namespace = deployment_meta.fetch('namespace')
    package_dir = File.join(options.fetch(:capsule_dir), release.dig('package', 'path'))

    Dir.mktmpdir("capsule-render-#{deployment}-") do |tmpdir|
      source_dir = File.join(tmpdir, 'source')
      env_types_dir = File.join(tmpdir, 'envTypes')
      deploy_dir = File.join(tmpdir, 'deploy')

      FileUtils.cp_r(package_dir, source_dir)
      FileUtils.mkdir_p(env_types_dir)
      FileUtils.cp_r(File.join(gitops_root, 'apps', 'codeai', 'envTypes', env_type), File.join(env_types_dir, env_type))
      FileUtils.cp_r(File.join(gitops_root, 'apps', 'codeai', 'envTypes', 'components'), File.join(env_types_dir, 'components'))
      FileUtils.cp_r(File.join(gitops_root, 'apps', 'codeai', 'kargo', 'templates', 'deploy'), deploy_dir)

      kustomization_path = File.join(deploy_dir, 'kustomization.yaml')
      kustomization = YAML.load_file(kustomization_path)
      kustomization['namespace'] = namespace
      kustomization['resources'] = ['../source/base']
      kustomization['components'] = ["../envTypes/#{env_type}"]
      kustomization['images'] = [
        {
          'name' => 'code-dot-org',
          'newName' => options.fetch(:image_repo),
          'newTag' => options.fetch(:image_tag)
        }
      ]
      File.write(kustomization_path, kustomization.to_yaml(line_width: -1))

      stdout, stderr, status = Open3.capture3('kustomize', 'build', deploy_dir)
      raise "kustomize build failed for #{deployment}: #{stderr}" unless status.success?
      raise "kustomize build returned no manifests for #{deployment}" if stdout.strip.empty?
    end
  end
end

ReleaseCapsuleContract.run!(ARGV)
