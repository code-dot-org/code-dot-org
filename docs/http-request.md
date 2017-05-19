# The life of a `code.org` HTTP Request

## DNS resolution

`code.org` => (DNS managed by route 53) => `54.192.37.35` (...etc...)

(`dig code.org` => `54.192.37.35`, `whois 54.192.37.35` <sup>[output](https://gist.github.com/wjordan/1f2c60e3fec28dbef5c774f08fb3c675)</sup> shows it's an Amazon-owned IP, `AMAZO-CF2` == CloudFront.)

## CDN / load-balancer

[CloudFront](https://aws.amazon.com/cloudfront/) => [Elastic Load Balancing](https://aws.amazon.com/elasticloadbalancing/) [ELB]

ELB => => multiple Frontend servers ([Elastic Compute Cloud](https://aws.amazon.com/ec2/) [EC2] with [Auto Scaling](https://aws.amazon.com/autoscaling/))

## Frontend Server
[Varnish Cache](https://varnish-cache.org/) (port `80`) => port `8080` (dashboard) or port `8081` (pegasus) (depending on `Host` header: `code.org` => `pegasus`, `studio.code.org` => `dashboard`)

[NGiNX](https://www.nginx.com/) (port `808{0,1}`) => Unix socket/s (`/run/unicorn/{dashboard,pegasus}.sock`)

[Unicorn](https://bogomips.org/unicorn/) (UNIX socket/s) => Ruby application Rack server/s

Rack server definition files:
- dashboard: [`dashboard/config.ru`](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/config.ru)
- pegasus: [`pegasus/config.ru`](https://github.com/code-dot-org/code-dot-org/blob/staging/pegasus/config.ru)

### Pegasus web-application (`/pegasus` - [code.org](https://code.org))

Web-application based on [`sinatra`](http://www.sinatrarb.com/) routing framework, with custom template and view-rendering layer.
- [`pegasus/router.rb`](https://github.com/code-dot-org/code-dot-org/blob/staging/pegasus/router.rb): - `class Documents < Sinatra::Base`
  - Additional routes are in [`pegasus/routes/*.rb`](https://github.com/code-dot-org/code-dot-org/tree/staging/pegasus/routes), which are all [recursively inserted](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L185) into the `Documents` class.
- [`get_head_or_post '*'`](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L200-L210) - `path` == `/` for root page request
- [`resolve_document(uri)`](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L380-L403) -> [`resolve_template('public', extnames, uri)`](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L358-L378) - resolves a URI to a path on the filesystem ending in `/public`. A [Sinatra `before` hook](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L118-L132) sets a directory to search based on the `Host` of the request [prepended](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L247-L249) with [`sites.v3`](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L80). (e.g.: `GET /` with header `Host: code.org` ultimately resolves to [`pegasus/sites.v3/code.org/public/index.haml`](https://github.com/code-dot-org/code-dot-org/blob/staging/pegasus/sites.v3/code.org/public/index.haml) on the filesystem.)
- [`document path`](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L273-L310) - read path from filesystem and render output
- [`render_ content, extname`](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L273-L310) - render content from template based on file extension
- [`after do` (Sinatra `after` hook)](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L212-L238) - load and render [`layouts/`](https://github.com/code-dot-org/code-dot-org/tree/staging/pegasus/sites.v3/code.org/layouts) and [`themes/`](https://github.com/code-dot-org/code-dot-org/tree/staging/pegasus/sites.v3/code.org/themes) templates from file:
  - layouts and themes 'wrap' themselves around the existing rendered body through the line: [`body render_template(template, @locals.merge({body: body.join('')}))`](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L229), which calls [`#body`](https://github.com/sinatra/sinatra/blob/v2.0.0/lib/sinatra/base.rb#L252-L254), which first reads (passed as a local variable to `#render_template`) and then updates the template-rendered result.

### Dashboard application (`/dashboard` - [studio.code.org](https://studio.code.org))

Standard Rails application.
- [`dashboard/config/routes.rb`](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/config/routes.rb) (run `rails routes` for fullly-rendered route map)
- Uses standard Rails routing and layouts/rendering (see [Ruby on Rails Guides](http://guides.rubyonrails.org/v5.0/) for full documentation, e.g., ["Routing"](http://guides.rubyonrails.org/v5.0/routing.html) and ["Layouts and Rendering"](http://guides.rubyonrails.org/v5.0/layouts_and_rendering.html))

### Shared middleware (`/shared`)

We have several [Rack](http://rack.github.io/) middleware<sup>[spec](http://www.rubydoc.info/github/rack/rack/master/file/SPEC)</sup> modules that are inserted into both Pegasus (via [`config.ru`](https://github.com/code-dot-org/code-dot-org/blob/980e4629bc8829bd1cdc5c9f04a5b1a3010292db/pegasus/config.ru#L39-L52)) and Dashboard (via [`application.rb`](https://github.com/code-dot-org/code-dot-org/blob/2342c08cd969e05af884a42baaf38e0e5565c18e/dashboard/config/application.rb#L46-L63)), and provide 'shared' functionality to both web-applications. Some of these middleware apps are their own self-contained Sinatra apps (e.g., [`FilesApi`](https://github.com/code-dot-org/code-dot-org/blob/ceaeea0101eaf3ed5d68f63e8bcdbecd7bd46106/shared/middleware/files_api.rb#L6)) that handle their defined routes<sup>[example](https://github.com/code-dot-org/code-dot-org/blob/ceaeea0101eaf3ed5d68f63e8bcdbecd7bd46106/shared/middleware/files_api.rb#L109)</sup> when inserted into the middleware 'stack' for each web-app.