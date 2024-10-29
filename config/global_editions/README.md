# Global Region Configurations

These configurations detail the properties and visibility of certain components
when viewing the site within a particular region. This relates to visiting the
studio.code.org site using a URL scheme like '/global/fa'. In this case, the
configuration here at `fa.yml` would be used to determine the appearance and
properties of particular components.

## Creating a Region

To create a region, create a YAML file here with the region name. Then, inside
the YAML file, there are several categories that provide context. There is the
`header` and `footer` sections which deal with the top and bottom navigation
of the site respectively.

The `header` is subdivided into `top`, `hamburger` and `help` which are the
different contexts within the header. The `top` is the main navigation links
that are visible at the top of the page. The `hamburger` is the three lined
button that provides a wider dropdown menu (which the top links coalesce into
in mobile views). The `help` menu is the dropdown that is used via the (?)
button.

Each of these header sections (except `help`) is itself split into user context
such as `student`, `teacher`, and `signed_out`. Then those sections are simply
an array of links. Each link item provides a title (which is also used for
translation), an id, the domain for the URL (`code.org`, `studio.code.org`), the
URL (`/home`, etc).

The `help` links can specify a `level` property that matches the name of a `Game`
type (e.g. `Spritelab`) where the entries only appear when within that type of
level. This is used to provide documentation for that particular level.

## Tips for Creating a New Region

You may find it useful to copy from an existing region that is most similar to
the one you are creating. Just copy, for instance, the `root.yml` to your named
region (e.g. `my-region.yml`) and restart your development server. There will
now be a clone of the `root` site experience at `/global/my-region`.
