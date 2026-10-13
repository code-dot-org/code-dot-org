nginx_test
====================
This test cookbook runs a simple Unicorn+Rack application behind Nginx
to serve live, individually-constructed HTTP requests through the proxy.
Unicorn is only a test stand-in: the application runs Puma, which Nginx
reaches at the same `/run/unicorn/dashboard.sock`.
