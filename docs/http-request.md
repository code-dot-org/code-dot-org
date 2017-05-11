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

### Pegasus application (`/pegasus`)

Web-application based on [`sinatra`](http://www.sinatrarb.com/) routing framework, with custom template and view-rendering layer.
- [`pegasus/router.rb`](https://github.com/code-dot-org/code-dot-org/blob/staging/pegasus/router.rb): - `class Documents < Sinatra::Base`
- [`get_head_or_post '*'`](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L200-L210) - `path` == `/` for root page request
- [`document path`](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L273-L310) - read path from filesystem and render output
  - Example: [`pegasus/sites.v3/code.org/public/index.haml`](https://github.com/code-dot-org/code-dot-org/blob/staging/pegasus/sites.v3/code.org/public/index.haml)
- [`render_ content, extname`](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L273-L310) - render content from template based on file extension
- [`after do` (Sinatra `after` hook)](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L212-L238) - load and render [`layouts/`](https://github.com/code-dot-org/code-dot-org/tree/staging/pegasus/sites.v3/code.org/layouts) and [`themes/`](https://github.com/code-dot-org/code-dot-org/tree/staging/pegasus/sites.v3/code.org/themes) templates from file:
  - layouts and themes 'wrap' themselves around the existing rendered body through the line: [`body render_template(template, @locals.merge({body: body.join('')}))`](https://github.com/code-dot-org/code-dot-org/blob/73afd7d4ad6a485bf22cac2656670d3816fd077c/pegasus/router.rb#L229), which calls [`#body`](https://github.com/sinatra/sinatra/blob/v2.0.0/lib/sinatra/base.rb#L252-L254), which first reads (passed as a local variable to `#render_template`) and then updates the template-rendered result.

### Dashboard application (`/dashboard`)

Standard Rails application.
- [`dashboard/config/routes.rb`](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/config/routes.rb) (run `rails routes` for fullly-rendered route map)
- Uses standard Rails routing and layouts/rendering (see [Ruby on Rails Guides](http://guides.rubyonrails.org/v5.0/) for full documentation, e.g., ["Routing"](http://guides.rubyonrails.org/v5.0/routing.html) and ["Layouts and Rendering"](http://guides.rubyonrails.org/v5.0/layouts_and_rendering.html))