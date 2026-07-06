# nginx-dead-config-cleanup — tasks

## 1. Deletions

- [ ] 1.1 Remove the `proxy_set_header X-Request-Start "t=${msec}"` line from `cookbooks/cdo-nginx/templates/default/nginx.conf.erb`
- [ ] 1.2 Delete `cookbooks/cdo-apps/templates/default/unicorn.sh.erb`
- [ ] 1.3 Delete `cookbooks/cdo-nginx/test/cookbooks/nginx_test/templates/default/unicorn.sh.erb` and prune nginx_test recipe references to it

## 2. Verification

- [ ] 2.1 `grep -rn "X-Request-Start" .` returns no hits outside git history
- [ ] 2.2 `grep -rln "unicorn.sh" cookbooks/` returns no hits
- [ ] 2.3 Confirm chef converge on an adhoc renders an unchanged `puma.service` unit and nginx reloads cleanly
