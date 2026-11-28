# cdo-wiz-sensor

Installs the [Wiz Runtime Sensor](https://docs.wiz.io/docs/runtime-sensor-solutions) on Linux hosts. The sensor is an eBPF agent that watches process, file and network activity and reports threats such as reverse shells, crypto miners, and tampering with system files to Wiz in real time. It complements the agentless scanning Wiz already does of our AWS accounts.

The recipe is included from `cdo-apps`, so it applies to frontends, the daemon and the console. It does nothing unless `node['cdo-wiz-sensor']['enabled']` is true.

## What you need first

1. A Wiz service account of type **Sensor** (Wiz → Settings → Access Management → Service Accounts). Wiz shows the client secret only once.
2. Two AWS Secrets Manager secrets per Chef environment, holding the plain string values:
   - `<env>/cdo/wiz_sensor_client_id`
   - `<env>/cdo/wiz_sensor_client_secret`
3. Outbound HTTPS from the hosts to `downloads.wiz.io`, `dpkg.wiz.io` and Wiz's backend (see [required URLs](https://docs.wiz.io/docs/req-urls-sensor)).

## Attributes

| Attribute | Default | What it does |
| --- | --- | --- |
| `enabled` | `false` | Install and run the sensor. Setting it back to `false` stops and disables the service. |
| `install_script_url` | Wiz's installer | Installer script. It is checked against the SHA256 Wiz publishes beside it. |
| `allow_runtime_response` | `false` | When false the sensor only detects. It will not kill processes on the host. |
| `start_delay_range_secs` | `60` | Random start delay, so a large scale-out does not start every sensor at once. |

## How frontends are handled

Frontends are not converged by Chef when they launch. They boot from an AMI built by an instance named `ami-<instance-id>`. On that builder the recipe installs the sensor and enables the service but does not start it, so the image holds no sensor state from the builder. Each frontend then starts the sensor on boot and registers itself.

The client ID and secret are written into the sensor's config on disk, so they are part of the AMI. The service account only has the Sensor scope.

## Changing settings

Wiz reads the sensor settings only at install time. The recipe stores a digest of the settings in `/opt/wiz/.cdo-config-digest` and reruns the installer when they change, for example after rotating the client secret.

## Checking a host

```
systemctl status wiz-sensor
ps awx | grep wiz-sensor
```

The host should appear under Wiz → Settings → Deployments → Sensor within a few minutes.
