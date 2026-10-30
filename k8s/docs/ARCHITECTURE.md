# Kubernetes Architecture

In our Kubernetes deployment model, `env_type` and `release_name` are separate.

- `env_type` is the class of environment, such as `staging`, `test`, `production`, `levelbuilder`, or `adhoc`.
- `release_name` is the concrete deployed instance within that environment type, such as `staging`, `autoscale-prod`, or `adhoc-seth-ruby-3-4-1`.

By default, Helm `releaseName` should map to the CloudFormation `stack_name`. In practice, the concrete deploy identity is usually the same string across:

- CloudFormation `stack_name`
- Helm `releaseName`
- ArgoCD application instance name

`env_type` controls shared environment-level behavior, especially:

- the Kubernetes namespace a deployment belongs to
- environment-scoped access permissions
- which environment-scoped secrets it can read

For example, the `staging` namespace should have access to `staging` secrets.

`release_name` controls instance identity, especially:

- the Helm release identity
- the CloudFormation stack identity
- stack-scoped secret naming

This distinction matters for secrets. A deployment may need both:

- environment-scoped secrets like `{env_type}/cdo/*`
- stack-scoped secrets like `CfnStack/{release_name}/*`

For more on how secrets flow into Kubernetes, see [Dashboard Secrets in Kubernetes (K8S)](./kubernetes-secrets.md).
