require 'base64'
require 'fileutils'
require 'json'
require 'open3'
require 'securerandom'
require 'shellwords'
require 'yaml'

module DashboardKustomize
  ROOT = File.expand_path('../..', __dir__)
  HELM_VALUES = File.join(ROOT, '..', 'helm', 'values.yaml')
  CHART_PATH = File.join(ROOT, '..', 'helm')
  MYSQL_SECRET_DIR = File.join(ROOT, 'components', 'mysql')
  REDIS_SECRET_DIR = File.join(ROOT, 'components', 'redis')
  MINIO_SECRET_DIR = File.join(ROOT, 'components', 'minio')
  IGNORE_LABELS = ['helm.sh/chart', 'app.kubernetes.io/managed-by'].freeze
  BASE_SECRET_ENV_ORDER = ['_mysql_root_password', '_redis_password', '_minio_root_password', '_minio_root_user'].freeze
  MYSQL_SECRET_ENV_ORDER = %w(_mysql_root_password db_writer db_reader reporting_db_writer reporting_db_reader db_credential_admin db_credential_writer db_credential_reader).freeze
  REDIS_SECRET_ENV_ORDER = ['_redis_password', 'redis_url', 'netsim_redis_groups'].freeze
  MINIO_SECRET_ENV_ORDER = ['_minio_root_password', '_minio_root_user', 'aws_s3_access_key_id', 'aws_s3_secret_access_key'].freeze
  LOCAL_SECRET_NAME = 'cdo-local-secrets'.freeze
  NAME_FIELDS = %w[name volumeName claimName].freeze
  RELEASE_NAME_FIELDS = %w[name serviceName volumeName claimName].freeze
  EMPTY_VALUES = [{}, []].freeze
  ACCEPTED_LOCAL_DEV_NAME_ALIASES = {
    'cdo-dot-aws' => 'dot-aws',
    'cdo-dot-config-gcloud' => 'dot-config-gcloud',
    'cdo-dashboard-job-setup-db' => 'dashboard-job-setup-db',
    'cdo-minio-setup-s3-job' => 'minio-setup-s3-job'
  }.freeze

  TARGETS = {
    'development' => {
      release_name: 'cdo',
      namespace: nil,
      services: {mysql: true, redis: true, minio: true},
      helm_values: [File.join(ROOT, '..', 'helm', 'development.values.yaml')],
      helm_set: []
    },
    'mount-dot-aws' => {
      release_name: 'cdo',
      namespace: nil,
      services: {mysql: true, redis: true, minio: true},
      helm_values: [File.join(ROOT, '..', 'helm', 'development.values.yaml')],
      helm_set: [
        ['--set', 'localDev.mounts.mountDotAWS=true'],
        ['--set', 'localDev.mounts.mountDotConfigGcloud=true'],
        ['--set-string', 'localDev.mounts.hostPaths.home=/Users/example'],
        ['--set-string', 'localDev.mounts.hostPaths.skaffoldStorage=/tmp/skaffold'],
        ['--set-string', 'localDev.mounts.AWS_PROFILE=default']
      ]
    },
    'development-setup-db' => {
      release_name: 'cdo',
      namespace: nil,
      services: {mysql: true, redis: true, minio: true},
      helm_values: [File.join(ROOT, '..', 'helm', 'development.values.yaml')],
      helm_set: [
        ['--set', 'dashboardJob.enabled=true'],
        ['--set', 'dashboardJob.name=setup-db'],
        ['--set-json', 'dashboardJob.command=["zsh","-c"]'],
        ['--set-json', %{dashboardJob.args=["cd dashboard && rake dashboard:setup_db && echo 'setup-db COMPLETE'"]}]
      ]
    },
    'development-setup-s3' => {
      release_name: 'cdo',
      namespace: nil,
      services: {mysql: true, redis: true, minio: true},
      helm_values: [File.join(ROOT, '..', 'helm', 'development.values.yaml')],
      helm_set: [
        ['--set', 'services.minio.runSetupS3Job=true']
      ]
    },
    'development-setup-db-setup-s3' => {
      release_name: 'cdo',
      namespace: nil,
      services: {mysql: true, redis: true, minio: true},
      helm_values: [File.join(ROOT, '..', 'helm', 'development.values.yaml')],
      helm_set: [
        ['--set', 'dashboardJob.enabled=true'],
        ['--set', 'dashboardJob.name=setup-db'],
        ['--set-json', 'dashboardJob.command=["zsh","-c"]'],
        ['--set-json', %{dashboardJob.args=["cd dashboard && rake dashboard:setup_db && echo 'setup-db COMPLETE'"]}],
        ['--set', 'services.minio.runSetupS3Job=true']
      ]
    },
    'production' => {
      release_name: 'cdo',
      namespace: nil,
      services: {mysql: false, redis: false, minio: false},
      helm_values: [File.join(ROOT, '..', 'helm', 'production.values.yaml')],
      helm_set: []
    },
    'test' => {
      release_name: 'cdo',
      namespace: nil,
      services: {mysql: false, redis: false, minio: false},
      helm_values: [File.join(ROOT, '..', 'helm', 'test.values.yaml')],
      helm_set: []
    },
    'staging' => {
      release_name: 'staging',
      namespace: 'staging',
      services: {mysql: false, redis: false, minio: false},
      helm_values: [
        File.join(ROOT, '..', 'k8s-gitops', 'apps', 'cdo', 'env-types', 'staging.values.yaml'),
        File.join(ROOT, '..', 'k8s-gitops', 'apps', 'cdo', 'releases', 'staging', 'values.yaml')
      ],
      helm_set: []
    },
    'levelbuilder' => {
      release_name: 'levelbuilder',
      namespace: 'levelbuilder',
      services: {mysql: false, redis: false, minio: false},
      helm_values: [
        File.join(ROOT, '..', 'k8s-gitops', 'apps', 'cdo', 'env-types', 'levelbuilder.values.yaml'),
        File.join(ROOT, '..', 'k8s-gitops', 'apps', 'cdo', 'releases', 'levelbuilder', 'values.yaml')
      ],
      helm_set: []
    },
    'autoscale-prod' => {
      release_name: 'autoscale-prod',
      namespace: 'production',
      services: {mysql: false, redis: false, minio: false},
      helm_values: [
        File.join(ROOT, '..', 'k8s-gitops', 'apps', 'cdo', 'env-types', 'production.values.yaml'),
        File.join(ROOT, '..', 'k8s-gitops', 'apps', 'cdo', 'releases', 'autoscale-prod', 'values.yaml')
      ],
      helm_set: []
    }
  }.freeze

  module_function def target_names
    TARGETS.keys
  end

  module_function def target_config(target)
    TARGETS.fetch(target) {raise ArgumentError, "unknown target: #{target}"}
  end

  module_function def component_name(release_name, component)
    if release_name.include?('cdo')
      "#{release_name}-#{component}"
    else
      "#{release_name}-cdo-#{component}"
    end
  end

  module_function def secret_input_dirs
    [MYSQL_SECRET_DIR, REDIS_SECRET_DIR, MINIO_SECRET_DIR]
  end

  module_function def helm_command(target)
    config = target_config(target)
    cmd = ['helm', 'template', config[:release_name], CHART_PATH, '-f', HELM_VALUES]
    config[:helm_values].each do |path|
      cmd.push('-f', path)
    end
    config[:helm_set].each do |flag, value|
      cmd.push(flag, value)
    end
    cmd
  end

  module_function def render_helm(target)
    stdout, stderr, status = Open3.capture3(*helm_command(target))
    raise "helm template failed for #{target}:\n#{stderr}" unless status.success?

    parse_yaml_stream(stdout)
  end

  module_function def render_kustomize(target)
    path = File.join(ROOT, 'targets', target)
    stdout, stderr, status = Open3.capture3('kustomize', 'build', path)
    raise "kustomize build failed for #{target}:\n#{stderr}" unless status.success?

    parse_yaml_stream(stdout)
  end

  module_function def parse_yaml_stream(text)
    YAML.load_stream(text).compact.select {|doc| doc.is_a?(Hash)}
  end

  module_function def find_secret_doc(docs)
    docs.find {|doc| doc['kind'] == 'Secret' && doc.dig('metadata', 'name') == 'cdo-local-secrets'}
  end

  module_function def parse_secret_values(doc)
    return {} unless doc

    values = {}
    (doc['data'] || {}).each do |key, value|
      values[key] = Base64.decode64(value.to_s)
    end
    (doc['stringData'] || {}).each do |key, value|
      values[key] = value.to_s
    end
    values
  end

  module_function def read_cluster_secret(namespace)
    cmd = ['kubectl']
    cmd.push('-n', namespace) if namespace && !namespace.empty?
    cmd.push('get', 'secret', 'cdo-local-secrets', '-o', 'yaml')
    stdout, _, status = Open3.capture3(*cmd)
    return nil unless status.success?

    YAML.safe_load(stdout)
  end

  module_function def random_alnum(length)
    alphabet = [('a'..'z'), ('A'..'Z'), ('0'..'9')].flat_map(&:to_a)
    Array.new(length) {alphabet[SecureRandom.random_number(alphabet.length)]}.join
  end

  module_function def seed_values(existing = {})
    {
      '_mysql_root_password' => existing['_mysql_root_password'] || random_alnum(24),
      '_redis_password' => existing['_redis_password'] || random_alnum(24),
      '_minio_root_password' => existing['_minio_root_password'] || random_alnum(24),
      '_minio_root_user' => existing['_minio_root_user'] || 'local-development'
    }
  end

  module_function def derive_secret_values(target, existing = {})
    config = target_config(target)
    values = seed_values(existing)
    release_name = config[:release_name]

    if config.dig(:services, :mysql)
      mysql_host = component_name(release_name, 'mysql')
      mysql_password = values.fetch('_mysql_root_password')
      values['db_writer'] = "mysql://root:#{mysql_password}@#{mysql_host}/"
      values['db_reader'] = "mysql://root:#{mysql_password}@#{mysql_host}/"
      values['reporting_db_writer'] = "mysql://root:#{mysql_password}@#{mysql_host}/"
      values['reporting_db_reader'] = "mysql://root:#{mysql_password}@#{mysql_host}/"
      credential = %({"username":"root","password":"#{mysql_password}"})
      values['db_credential_admin'] = credential
      values['db_credential_writer'] = credential
      values['db_credential_reader'] = credential
    end

    if config.dig(:services, :redis)
      redis_host = component_name(release_name, 'redis')
      redis_password = values.fetch('_redis_password')
      values['redis_url'] = "redis://:#{redis_password}@#{redis_host}:6379/0"
      values['netsim_redis_groups'] = %([{"master":"redis://:#{redis_password}@#{redis_host}:6379"}])
    end

    if config.dig(:services, :minio)
      values['aws_s3_access_key_id'] = values.fetch('_minio_root_user')
      values['aws_s3_secret_access_key'] = values.fetch('_minio_root_password')
    end

    values
  end

  module_function def write_secret_inputs(target, values)
    config = target_config(target)

    if config.dig(:services, :mysql)
      write_env_file(MYSQL_SECRET_DIR, 'cdo-local-secret-mysql.secret.env', MYSQL_SECRET_ENV_ORDER, values)
    else
      remove_generated_file(MYSQL_SECRET_DIR, 'cdo-local-secret-mysql.secret.env')
    end

    if config.dig(:services, :redis)
      write_env_file(REDIS_SECRET_DIR, 'cdo-local-secret-redis.secret.env', REDIS_SECRET_ENV_ORDER, values)
    else
      remove_generated_file(REDIS_SECRET_DIR, 'cdo-local-secret-redis.secret.env')
    end

    if config.dig(:services, :minio)
      write_env_file(MINIO_SECRET_DIR, 'cdo-local-secret-minio.secret.env', MINIO_SECRET_ENV_ORDER, values)
    else
      remove_generated_file(MINIO_SECRET_DIR, 'cdo-local-secret-minio.secret.env')
    end
  end

  module_function def write_env_file(dir, filename, keys, values)
    FileUtils.mkdir_p(dir)
    env_lines = keys.filter_map do |key|
      next unless values.key?(key)
      "#{key}=#{values[key]}"
    end
    File.write(File.join(dir, filename), "#{env_lines.join("\n")}\n")
  end

  module_function def remove_generated_file(dir, filename)
    path = File.join(dir, filename)
    FileUtils.rm_f(path)
  end

  module_function def load_existing_secret_values(target, from_file: nil)
    doc =
      if from_file
        YAML.safe_load_file(from_file)
      else
        read_cluster_secret(target_config(target)[:namespace])
      end
    parse_secret_values(doc)
  end

  module_function def normalize_docs(docs)
    docs.map {|doc| normalize_doc(doc)}.
        sort_by {|doc| [doc['kind'].to_s, doc.dig('metadata', 'namespace').to_s, doc.dig('metadata', 'name').to_s]}
  end

  module_function def normalize_docs_for_parity(target, docs)
    normalized_docs = normalize_docs(docs).map do |doc|
      copy = deep_copy(doc)
      normalize_release_name_drift!(copy, target)
      normalize_local_secret_name_drift!(copy)
      normalize_local_secret_value_drift!(copy)
      deep_sort(copy)
    end

    normalized_docs.sort_by do |doc|
      [doc['kind'].to_s, doc.dig('metadata', 'namespace').to_s, doc.dig('metadata', 'name').to_s]
    end
  end

  module_function def normalize_doc(doc)
    copy = deep_copy(doc)
    strip_ignored_labels!(copy)
    normalize_secret!(copy)
    copy['metadata']&.delete('labels') if copy['kind'] == 'HorizontalPodAutoscaler'
    normalize_statefulset_volume_claim_templates!(copy)
    normalize_order_insensitive_lists!(copy)
    remove_empty_hashes!(copy)
    remove_nil_values!(copy)
    deep_sort(copy)
  end

  module_function def deep_copy(obj)
    Marshal.load(Marshal.dump(obj))
  end

  module_function def strip_ignored_labels!(obj)
    case obj
    when Hash
      if obj['labels'].is_a?(Hash)
        IGNORE_LABELS.each {|label| obj['labels'].delete(label)}
      end
      obj.each_value {|value| strip_ignored_labels!(value)}
    when Array
      obj.each {|value| strip_ignored_labels!(value)}
    end
  end

  module_function def normalize_secret!(doc)
    return unless doc['kind'] == 'Secret'

    values = {}
    (doc['data'] || {}).each do |key, value|
      values[key] = Base64.decode64(value.to_s)
    end
    (doc['stringData'] || {}).each do |key, value|
      values[key] = value.to_s
    end
    doc.delete('data')
    doc['stringData'] = values
  end

  module_function def warning_messages(target, helm_docs, kustomize_docs)
    warnings = []
    helm_secret = parse_secret_values(find_secret_doc(helm_docs))
    kustomize_secret = parse_secret_values(find_local_secret_doc(kustomize_docs))

    if production_or_test_target?(target) && release_name_drift?(target, helm_docs, kustomize_docs)
      warnings << 'accepted drift by Seth: release naming differs from Helm for production/test resources'
    end

    if local_secret_name_drift?(helm_docs, kustomize_docs)
      warnings << 'accepted drift by Seth: cdo-local-secrets naming differs from Helm'
    end

    if local_dev_name_drift?(helm_docs, kustomize_docs)
      warnings << 'accepted drift by Seth: some development-only auxiliary resource names differ from Helm'
    end

    if accepted_secret_value_drift?(helm_secret, kustomize_secret)
      warnings << 'accepted drift by Seth: local secret values differ from Helm-generated values'
    end

    if redis_group_format_drift?(helm_secret, kustomize_secret)
      warnings << 'accepted drift by Seth: netsim_redis_groups format differs (Helm YAML block vs kustomize JSON string)'
    end

    warnings
  end

  module_function def find_local_secret_doc(docs)
    docs.find do |doc|
      doc['kind'] == 'Secret' &&
        doc.dig('metadata', 'labels', 'app.kubernetes.io/component') == 'cdo-local-secrets'
    end
  end

  module_function def production_or_test_target?(target)
    ['production', 'test'].include?(target)
  end

  module_function def release_prefix_for(target)
    return 'production-' if target == 'production'
    return 'test-' if target == 'test'

    nil
  end

  module_function def release_name_drift?(target, helm_docs, kustomize_docs)
    return false unless production_or_test_target?(target)

    normalize_docs(helm_docs) != normalize_docs(kustomize_docs)
  end

  module_function def local_secret_name_drift?(helm_docs, kustomize_docs)
    helm_secret = find_secret_doc(helm_docs)
    kustomize_secret = find_local_secret_doc(kustomize_docs)
    return false unless helm_secret && kustomize_secret

    helm_secret.dig('metadata', 'name') != kustomize_secret.dig('metadata', 'name')
  end

  module_function def accepted_secret_value_drift?(helm_secret, kustomize_secret)
    accepted_keys = %w(
      _mysql_root_password
      _redis_password
      _minio_root_password
      aws_s3_secret_access_key
      db_credential_admin
      db_credential_writer
      db_credential_reader
      db_writer
      db_reader
      reporting_db_writer
      reporting_db_reader
      redis_url
    )

    accepted_keys.any? {|key| helm_secret[key] != kustomize_secret[key]}
  end

  module_function def local_dev_name_drift?(helm_docs, kustomize_docs)
    helm_names = normalize_docs(helm_docs).flat_map {|doc| extract_relevant_names(doc)}.uniq.sort
    kustomize_names = normalize_docs(kustomize_docs).flat_map {|doc| extract_relevant_names(doc)}.uniq.sort
    helm_names != kustomize_names &&
      helm_names.map {|name| ACCEPTED_LOCAL_DEV_NAME_ALIASES.fetch(name, name)} == kustomize_names.map {|name| ACCEPTED_LOCAL_DEV_NAME_ALIASES.fetch(name, name)}
  end

  module_function def redis_group_format_drift?(helm_secret, kustomize_secret)
    helm_value = helm_secret['netsim_redis_groups']
    kustomize_value = kustomize_secret['netsim_redis_groups']
    return false if helm_value.nil? || kustomize_value.nil?

    helm_value != kustomize_value &&
      canonicalize_netsim_redis_groups(helm_value) == canonicalize_netsim_redis_groups(kustomize_value)
  end

  module_function def normalize_release_name_drift!(obj, target)
    prefix = release_prefix_for(target)
    return unless prefix

    case obj
    when Hash
      obj.each do |key, value|
        if RELEASE_NAME_FIELDS.include?(key) && value.is_a?(String) && value.start_with?(prefix)
          obj[key] = value.delete_prefix(prefix)
        elsif key == 'app.kubernetes.io/instance' && value.is_a?(String)
          obj[key] = target_config(target)[:release_name]
        else
          normalize_release_name_drift!(value, target)
        end
      end
    when Array
      obj.each {|value| normalize_release_name_drift!(value, target)}
    end
  end

  module_function def normalize_local_secret_name_drift!(obj)
    case obj
    when Hash
      if obj['kind'] == 'Secret' && obj.dig('metadata', 'labels', 'app.kubernetes.io/component') == 'cdo-local-secrets'
        obj['metadata']['name'] = LOCAL_SECRET_NAME
      end

      obj.each do |key, value|
        if NAME_FIELDS.include?(key) && value.is_a?(String) && value.end_with?(LOCAL_SECRET_NAME)
          obj[key] = LOCAL_SECRET_NAME
        elsif NAME_FIELDS.include?(key) && value.is_a?(String) && ACCEPTED_LOCAL_DEV_NAME_ALIASES.key?(value)
          obj[key] = ACCEPTED_LOCAL_DEV_NAME_ALIASES.fetch(value)
        else
          normalize_local_secret_name_drift!(value)
        end
      end
    when Array
      obj.each {|value| normalize_local_secret_name_drift!(value)}
    end
  end

  module_function def normalize_local_secret_value_drift!(doc)
    return unless doc['kind'] == 'Secret'
    return unless doc.dig('metadata', 'labels', 'app.kubernetes.io/component') == 'cdo-local-secrets'

    values = doc['stringData'] || {}
    values['_mysql_root_password'] = '<mysql-root-password>' if values.key?('_mysql_root_password')
    values['_redis_password'] = '<redis-password>' if values.key?('_redis_password')
    values['_minio_root_password'] = '<minio-root-password>' if values.key?('_minio_root_password')
    values['aws_s3_secret_access_key'] = '<minio-root-password>' if values.key?('aws_s3_secret_access_key')

    %w[db_writer db_reader reporting_db_writer reporting_db_reader redis_url].each do |key|
      values[key] = canonicalize_url_secret_value(values[key]) if values.key?(key)
    end

    %w[db_credential_admin db_credential_writer db_credential_reader].each do |key|
      values[key] = canonicalize_db_credential(values[key]) if values.key?(key)
    end

    values['netsim_redis_groups'] = canonicalize_netsim_redis_groups(values['netsim_redis_groups']) if values.key?('netsim_redis_groups')
    doc['stringData'] = values
  end

  module_function def canonicalize_url_secret_value(value)
    return value unless value.is_a?(String)

    value.sub(/:(?<secret>[^:@\/]+)@/, ':<secret>@')
  end

  module_function def canonicalize_db_credential(value)
    parsed = JSON.parse(value)
    parsed['password'] = '<secret>' if parsed.is_a?(Hash) && parsed.key?('password')
    JSON.generate(parsed)
  rescue JSON::ParserError
    value
  end

  module_function def canonicalize_netsim_redis_groups(value)
    parsed =
      begin
        JSON.parse(value)
      rescue JSON::ParserError
        YAML.safe_load(value)
      end

    return value unless parsed.is_a?(Array)

    canonical = parsed.map do |entry|
      next entry unless entry.is_a?(Hash) && entry['master'].is_a?(String)

      entry.merge('master' => canonicalize_url_secret_value(entry['master']))
    end
    JSON.generate(canonical)
  rescue Psych::SyntaxError
    value
  end

  module_function def extract_relevant_names(obj, result = [])
    case obj
    when Hash
      obj.each do |key, value|
        result << value if NAME_FIELDS.include?(key) && value.is_a?(String)
        extract_relevant_names(value, result)
      end
    when Array
      obj.each {|value| extract_relevant_names(value, result)}
    end
    result
  end

  module_function def remove_empty_hashes!(obj)
    case obj
    when Hash
      obj.keys.each do |key|
        value = obj[key]
        remove_empty_hashes!(value)
        obj.delete(key) if EMPTY_VALUES.include?(value)
      end
    when Array
      obj.each {|value| remove_empty_hashes!(value)}
      obj.reject! {|value| EMPTY_VALUES.include?(value)}
    end
  end

  module_function def remove_nil_values!(obj)
    case obj
    when Hash
      obj.keys.each do |key|
        value = obj[key]
        remove_nil_values!(value)
        obj.delete(key) if value.nil?
      end
    when Array
      obj.each {|value| remove_nil_values!(value)}
    end
  end

  module_function def normalize_statefulset_volume_claim_templates!(doc)
    return unless doc['kind'] == 'StatefulSet'

    (doc.dig('spec', 'volumeClaimTemplates') || []).each do |claim|
      claim['metadata']&.delete('labels')
    end
  end

  module_function def normalize_order_insensitive_lists!(obj)
    case obj
    when Hash
      if obj['env'].is_a?(Array)
        obj['env'] = obj['env'].sort_by {|value| value['name'].to_s}
      end
      if obj['volumeMounts'].is_a?(Array)
        obj['volumeMounts'] = obj['volumeMounts'].sort_by {|value| [value['name'].to_s, value['mountPath'].to_s]}
      end
      if obj['volumes'].is_a?(Array)
        obj['volumes'] = obj['volumes'].sort_by {|value| value['name'].to_s}
      end
      obj.each_value {|value| normalize_order_insensitive_lists!(value)}
    when Array
      obj.each {|value| normalize_order_insensitive_lists!(value)}
    end
  end

  module_function def deep_sort(obj)
    case obj
    when Hash
      obj.keys.sort.each_with_object({}) do |key, acc|
        acc[key] = deep_sort(obj[key])
      end
    when Array
      obj.map {|value| deep_sort(value)}
    else
      obj
    end
  end
end
