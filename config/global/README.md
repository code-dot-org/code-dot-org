# Global Region Configurations

These configurations detail the properties and visibility of certain components
when viewing the site within a particular region. This relates to visiting the
studio.code.org site using a URL scheme like '/global/fa'. In this case, the
configuration here at `fa.yml` would be used to determine the appearance and
properties of particular components.

## Creating a Region

To create a region, create a YAML file here with the region name. Then, inside
the YAML file, you list the page context first (`header`, `footer`, `home`,
etc) and then within that nest the components themselves.

You may find it useful to copy from an existing region that is most similar to
the one you are creating.
