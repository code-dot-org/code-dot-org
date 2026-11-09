# frontend-http-serving — delta for nginx-dead-config-cleanup

## ADDED Requirements

### Requirement: Instance proxy config contains only consumed directives
The instance-level HTTP proxy configuration SHALL contain only directives
with an identifiable consumer; headers injected for removed integrations
SHALL be deleted.

#### Scenario: X-Request-Start is not injected
- **WHEN** nginx proxies a request to the Puma unix socket
- **THEN** the request carries no `X-Request-Start` header

### Requirement: Only the active app server has deploy templates
The cookbooks SHALL carry service/launcher templates only for the app
server named by `node['cdo-apps']['app_server']`.

#### Scenario: No Unicorn launcher template
- **WHEN** the cdo-apps cookbook is synced to a node with `app_server: puma`
- **THEN** no `unicorn.sh.erb` template exists in the cdo-apps cookbook (the nginx_test fixture's vendored copy is out of scope)
- **THEN** the rendered systemd unit is `puma.service.erb`'s output, unchanged
