# adhoc-puma-tls — tasks

## 1. Pre-flight

- [ ] 1.1 Grep dashboard/, lib/, apps/src/ for `localhost:8080` / `127.0.0.1:8080` self-calls that relied on nginx's `dashboard_proxy` listener; confirm none (or migrate them to the canonical hostname)
- [ ] 1.2 [ops] `alb-direct-cutover` deployed and soaked (nginx already gone from LB environments)

## 2. Puma config

- [ ] 2.1 Extend the bind block in `dashboard/config/puma.rb` per the design table: `tcp://0.0.0.0:#{CDO.dashboard_http_port}` when set, and `ssl_bind '0.0.0.0', CDO.dashboard_ssl_port, cert: CDO.dashboard_ssl_cert, key: CDO.dashboard_ssl_key, verify_mode: 'none', no_tlsv1: true, no_tlsv1_1: true` when set; development fallback fires only when no key is set
- [ ] 2.2 Add `AmbientCapabilities=CAP_NET_BIND_SERVICE` to `cookbooks/cdo-apps/templates/default/puma.service.erb`, rendered only when the template variable for non-LB nodes is true; thread the variable through `cdo_apps.rb`'s template resource

## 3. Chef

- [ ] 3.1 Add `cdo-apps::tls` recipe for non-LB nodes: `ssl_certificate` resource (same attribute namespace bootstrap writes today, self-signed fallback preserved), writes cert/key paths and ports (80/443) into cdo-secrets, notifies `execute[restart dashboard service]`
- [ ] 3.2 In `cdo-apps/recipes/default.rb`, non-LB nodes include `cdo-apps::tls` and `cdo-nginx::stop` (LB nodes already stop-only after `alb-direct-cutover`); no node sets `dashboard_sock` any longer
- [ ] 3.3 Extend the `dashboard_listeners` file-resource content with the http/ssl ports so bind changes restart Puma
- [ ] 3.4 Record follow-up: delete the cdo-nginx cookbook (and the `puma.rb` sock branch) once converged fleets have shed nginx

## 4. Verification

- [ ] 4.1 [ops] Fresh adhoc: `https://<adhoc>/` serves with the injected cert (check issuer, TLS 1.2 floor via `openssl s_client`); `http://<adhoc>/` serves plain; nginx absent
- [ ] 4.2 [ops] Existing adhoc converge: nginx stopped and removed compile-phase, Puma rebinds 80/443, site up
- [ ] 4.3 [ops] Cert rotation on an adhoc restarts dashboard and serves the new cert
- [ ] 4.4 [ops] Self-signed fallback path: adhoc created without cert content serves HTTPS with the self-signed cert
- [ ] 4.5 [ops] `systemd-analyze security dashboard` (or unit inspection) confirms CAP_NET_BIND_SERVICE only on adhoc units, absent on LB nodes

Tasks marked [ops] require adhoc/AWS access: implement 1.1–3.x, then hand off.
