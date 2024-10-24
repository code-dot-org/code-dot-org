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
such as `student`, `teacher`, and `signed_out`. Then those sections are  simply
an array of links. Each link item provides a title (which is also used for
translation), an id, the domain for the URL (`code.org`, `studio.code.org`), the
URL (`/home`, etc).

Then there is a general `pages` section. This lists a set of filters to modify
different studio pages.

When we navigate to such a page that matches `/global/:region<your mask>`
the specifically wrapped components will check this table. Their properties
will get overriden with those specified here.

This table is checked top to bottom to find the last matching route that
contains a set of properties. Only those properties are considered. If
`false` is provided instead of a set of properties, the component is not
rendered at all.

Ex: (config/global/foo.yml)

```
pages:
  - path: /
    components:
      MarketingAnnouncementComponent: false
  - path: /home
    components:
      MarketingAnnouncementComponent:
        announcement:
          body: This is a Farsi only announcement.
          buttonId: blah
          buttonText: FARSI!
          buttonUrl: /
          id: farsi-announcement
          image: /shared/images/teacher-announcement/incubator-announcement.png
          title: foo
```
      
When we navigate to the /global/foo/home page, any MarketingAnnouncement will
have its normal announcement replaced with the configured one. Whereas, on any
other page, the '/' would match, and the `false` indicates the component should
be removed.

You may find it useful to copy from an existing region that is most similar to
the one you are creating.
