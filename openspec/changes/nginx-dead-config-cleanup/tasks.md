# nginx-dead-config-cleanup — tasks

## 1. Deletions

- [ ] 1.1 Remove the `proxy_set_header X-Request-Start "t=${msec}"` line (line 23) from `cookbooks/cdo-nginx/templates/default/nginx.conf.erb`
- [ ] 1.2 Delete `cookbooks/cdo-apps/templates/default/unicorn.sh.erb`. Do NOT touch `cookbooks/cdo-nginx/test/cookbooks/nginx_test/` — its unicorn.sh.erb is a separate vendored fixture (see design)

## 2. Verification

- [ ] 2.1 `grep -rn "X-Request-Start" cookbooks/ dashboard/ lib/ apps/src/` returns no hits
- [ ] 2.2 `grep -rln "unicorn.sh" cookbooks/` returns only the nginx_test fixture
- [ ] 2.3 [ops] Chef converge on any adhoc renders an unchanged `puma.service` unit and nginx reloads cleanly (human/ops gate — an implementing agent cannot converge; request this verification and stop)
