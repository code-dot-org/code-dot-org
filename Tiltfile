config.define_string('env')
config.define_string('mode')
config.define_bool('local-creds')
config.define_bool('allow-remote')

cfg = config.parse()

env_name = cfg.get('env', 'development')
mode = cfg.get('mode', 'full')
local_creds = cfg.get('local-creds', False)
allow_remote = cfg.get('allow-remote', False)

valid_envs = ['development', 'test', 'production']
valid_modes = ['full', 'mimic']
local_contexts = ['docker-desktop', 'minikube']

if env_name not in valid_envs:
    fail('Invalid --env=%s. Expected one of: %s' % (env_name, ', '.join(valid_envs)))

if mode not in valid_modes:
    fail('Invalid --mode=%s. Expected one of: %s' % (mode, ', '.join(valid_modes)))

current_context = str(local('kubectl config current-context', quiet=True)).strip()
is_local_context = current_context in local_contexts

if is_local_context:
    allow_k8s_contexts(local_contexts)
elif not allow_remote:
    fail('Refusing to run against kube context %s. Use a local context (%s) or pass --allow-remote=true.' % (
        current_context,
        ', '.join(local_contexts),
    ))

registry = os.getenv('CDO_TILT_REGISTRY', '')
if not is_local_context and allow_remote:
    if not registry:
        fail('CDO_TILT_REGISTRY is required when --allow-remote=true.')
    default_registry(registry)

k8s_ns = str(local('kubectl config view --minify --output "jsonpath={..namespace}"', quiet=True)).strip()
namespace = k8s_ns if k8s_ns else 'default'

full_mode = mode == 'full'
mimic_mode = mode == 'mimic'

if mimic_mode:
    local('k8s/mimic/bin/update-cdo-no-symlinks.sh')

def shell_quote(value):
    return "'" + str(value).replace("'", "'\"'\"'") + "'"

def bool_string(value):
    return 'true' if value else 'false'

def image_ref(base):
    if mimic_mode:
        return {
            'code-dot-org': 'mimic',
            'code-dot-org-core': 'mimic-core',
            'code-dot-org-pegasus': 'mimic-pegasus',
            'code-dot-org-static': 'mimic-static',
            'code-dot-org-db-seed': 'mimic-db-seed',
        }[base]
    return base

def lines(command):
    output = str(local(command, quiet=True)).strip()
    return [line for line in output.split('\n') if line] if output else []

docker_build(
    image_ref('code-dot-org-core'),
    'k8s/mimic/cdo-no-symlinks' if mimic_mode else '.',
    dockerfile='k8s/docker/code-dot-org-core.dockerfile',
    build_args={
        'USERNAME': 'root',
        'UID': '0',
        'GID': '0',
    },
)

docker_build(
    image_ref('code-dot-org-pegasus'),
    'k8s/mimic/cdo-no-symlinks' if mimic_mode else '.',
    dockerfile='k8s/docker/code-dot-org-pegasus.dockerfile',
)

docker_build(
    image_ref('code-dot-org-static'),
    'k8s/mimic/cdo-no-symlinks' if mimic_mode else '.',
    dockerfile='k8s/docker/code-dot-org-static.dockerfile',
)

docker_build(
    image_ref('code-dot-org-db-seed'),
    'k8s/mimic/cdo-no-symlinks' if mimic_mode else '.',
    dockerfile='k8s/docker/code-dot-org-db-seed.dockerfile',
)

docker_build(
    image_ref('code-dot-org'),
    'k8s/mimic/cdo-no-symlinks' if mimic_mode else '.',
    dockerfile='k8s/docker/code-dot-org.dockerfile',
    build_args={
        'CODE_DOT_ORG_CORE': image_ref('code-dot-org-core'),
        'CODE_DOT_ORG_DB_SEED': image_ref('code-dot-org-db-seed'),
        'CODE_DOT_ORG_PEGASUS': image_ref('code-dot-org-pegasus'),
        'CODE_DOT_ORG_STATIC': image_ref('code-dot-org-static'),
    },
    live_update=([
        fall_back_on(
            [
                '.dockerignore',
                '.ruby-version',
                'Gemfile',
                'Gemfile.lock',
                'pyproject.toml',
                'uv.lock',
                'apps/package.json',
                'apps/yarn.lock',
                'apps/.yarnrc.yml',
            ] +
            lines("find apps/.yarn -type f ! -path 'apps/.yarn/cache/*'") +
            lines("find frontend/packages -mindepth 2 -maxdepth 2 -name package.json -type f") +
            lines("find python -name pyproject.toml -type f ! -path '*/.venv/*'") +
            lines("find k8s/docker -maxdepth 1 \\( -name '*.dockerfile' -o -name '*.dockerfile.dockerignore' \\) -type f")
        ),
        sync('.', '/code-dot-org'),
    ] if full_mode else []),
)

helm_value_files = [
    'k8s/helm/values.yaml',
    'k8s/helm/%s' % {
        'development': 'development.values.yaml',
        'test': 'test.values.yml',
        'production': 'production.values.yaml',
    }[env_name],
]

helm_set_args = [
    'image=%s' % image_ref('code-dot-org'),
    'user.username=root',
    'user.uid=0',
    'user.gid=0',
    'user.home=/home/root',
    'localDev.mounts.mountDotAWS=%s' % bool_string(local_creds),
    'localDev.mounts.mountDotConfigGcloud=%s' % bool_string(local_creds),
    'localDev.mounts.hostPaths.home=%s' % os.getenv('HOME', ''),
    'localDev.mounts.AWS_PROFILE=%s' % os.getenv('AWS_PROFILE', ''),
]

k8s_yaml(helm(
    './k8s/helm',
    name='cdo',
    values=helm_value_files,
    set=helm_set_args,
))

k8s_resource(
    'cdo-dashboard',
    resource_deps=['mimic-context'] if mimic_mode else [],
    port_forwards=[
        port_forward(13000, 3000, name='dashboard'),
        port_forward(19000, 9000, name='dashboard-hmr'),
    ],
)

if env_name == 'development':
    k8s_resource('cdo-mysql', port_forwards=[port_forward(13306, 3306, name='mysql')])
    k8s_resource('cdo-redis', port_forwards=[port_forward(16379, 6379, name='redis')])
    k8s_resource(
        'cdo-minio',
        port_forwards=[
            port_forward(29000, 9000, name='minio-api'),
            port_forward(29001, 9001, name='minio-console'),
        ],
    )

if mimic_mode:
    local_resource(
        'mimic-context',
        'k8s/mimic/bin/update-cdo-no-symlinks.sh',
        deps=['.'],
    )

if env_name == 'development':
    def helm_template_command(extra_args=[]):
        return ' '.join(
            [
                'helm',
                'template',
                'cdo',
                './k8s/helm',
            ] +
            [shell_quote(arg) for arg in (
                [item for value_file in helm_value_files for item in ['--values', value_file]] +
                [item for set_arg in helm_set_args for item in ['--set', set_arg]]
            )] +
            [arg for extra_arg in extra_args for arg in extra_arg]
        )

    def kubectl_job(namespace_value, job_name):
        return 'job/%s -n %s' % (job_name, shell_quote(namespace_value))

    def run_manual_job(delete_job_name, apply_command, job_name, timeout):
        return ' '.join([
            'set -e;',
            'kubectl delete job %s -n %s --ignore-not-found=true >/dev/null 2>&1 || true;' % (
                delete_job_name,
                shell_quote(namespace),
            ),
            '%s | kubectl apply -n %s -f -;' % (apply_command, shell_quote(namespace)),
            '((until kubectl logs %s --follow --tail=-1; do sleep 2; done) &) ;' % kubectl_job(namespace, job_name),
            'LOG_PID=$!;',
            'kubectl wait --for=condition=complete %s --timeout=%s;' % (
                kubectl_job(namespace, job_name),
                timeout,
            ),
            'wait $LOG_PID',
        ])

    local_resource(
        'setup-s3',
        run_manual_job(
            'cdo-minio-setup-s3-job',
            helm_template_command([
                ['--show-only', shell_quote('templates/services/minio.yaml')],
                ['--set', shell_quote('services.minio.runSetupS3Job=true')],
            ]),
            'cdo-minio-setup-s3-job',
            '30m',
        ),
        resource_deps=['cdo-minio'],
        auto_init=False,
        trigger_mode=TRIGGER_MODE_MANUAL,
    )

    local_resource(
        'setup-db',
        run_manual_job(
            'cdo-dashboard-job-setup-db',
            helm_template_command([
                ['--show-only', shell_quote('templates/dashboard/dashboard-job.yaml')],
                ['--set', shell_quote('dashboardJob.enabled=true')],
                ['--set', shell_quote('dashboardJob.name=setup-db')],
                ['--set', shell_quote('dashboardJob.command[0]=zsh')],
                ['--set', shell_quote('dashboardJob.command[1]=-c')],
                ['--set', shell_quote("dashboardJob.args[0]=cd dashboard && rake dashboard:setup_db && echo 'setup-db COMPLETE'")],
            ]),
            'cdo-dashboard-job-setup-db',
            '60m',
        ),
        resource_deps=['cdo-mysql'],
        auto_init=False,
        trigger_mode=TRIGGER_MODE_MANUAL,
    )
