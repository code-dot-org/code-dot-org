# Sandbox

In order to safely run arbitrary code, we need to create some aspect of
isolation. In our case, we want to run the Phaser-based preview in an
iframe served from a different domain. The Rule and other learner-owned
code is loaded into that domain's iframe, too. All necessary
communication needs to be done via the iframe message system. For
instance, debugging messages.

We will have a separate domain as a sandbox. That domain will have the
appropriate CSP to serve and run the scripts from that domain and
communicate via the messaging system for debugging callbacks and other
communication with the editor interfaces. The CSP and possibly injected
service worker will prevent the arbitrary loading of networked assets
or any kind of page or session takeover.

All learner-derived code will live and run in that iframe. There can be
no exceptions.
