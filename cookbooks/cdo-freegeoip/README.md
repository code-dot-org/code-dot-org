# cdo-freegeoip

Installs [freegeoip](https://github.com/fiorix/freegeoip) software via the [freegeoip](https://github.com/infertux/chef-freegeoip) Chef cookbook.

## Compatibility

Note that due to a [limitation](https://github.com/docker/docker/issues/1070#issuecomment-22206125) in the Docker AUFS driver,
this cookbook will not run correctly within a Docker container.

## Testing

To run the integration tests for this cookbook you must use the kitchen-ec2 driver, not the default kitchen-docker driver.
