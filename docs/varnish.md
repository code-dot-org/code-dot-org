# Varnish

Varnish's primary responsibility is offloading as much static traffic off of our front-end Ruby servers as possible because Varnish is order(s) of magnitude faster at serving static content. Varnish is so fast because it's compiled. Plus, we use it with the entire cache in RAM which makes it *really* fast. In this role, it's useful to think of Varnish as **equivilent to a CDN** and Varnish instances as **units of bandwidth** within that CDN.

We use Varnish to **route traffic**. For example we have a rule that sends all [learn.code.org](http://learn.code.org/) to the Dashboard application while [code.org](http://code.org/), [csedweek.org](http://csedweek.org/), etc. requests are sent to the Pegasus application. Routing rules are written in a C-like configuration languge that Varnish compiles to native code making them extremely fast. It is useful to think of Varnish as an **intelligent programmable router**. 

The routing logic goes well beyond URL matching - cookies, headers, even content can be inspected and/or modified for using in routing and handling. This allows similiar requests to be normalized into identical requests to maximize cachability. For example, we use a combination of cookies, browser settings, and other criteria to select the right language to present to the user. By normalizing these requests into a Varnish-added "X-Varnish-Language" header we get great cachability no matter *how* a user chooses their preferred language. Therefore, Varnish is also a tool for **validating and normalizing requests**.

Varnish uses a pool of back-end connection threads/fibers to service a much larger pool of client connections. This moves dispatching of work/blocking into the compiled portion of our stack where the cost of the thread can be measured in KB instead of MB. It's useful to think of Varnish as funneling a bunch of unruly burito eaters into line at Chipolte: fewer do more, faster, for less money. In this role, it's useful to think of Varnish as **directing/balancing traffic**.

## Frequently Asked Questions

### Where does Varnish run?

Right now Varnish (version [3.0.4](https://www.varnish-cache.org/releases/varnish-cache-3.0.4)) runs on the same AWS instances as our Ruby apps because everything fits. During CSEdWeek/HoC we ran Varnish on cheap stand-alone instances to increase horizontal capacity (tons of pipes, piles of bandwidth) at low cost. At that time there were three Varnish instances per Ruby server.

Currently with three ruby front ends we are almost bandwidth constrained but have plenty of CPU available. For the cost of 3/4 of a new Ruby instance we can deploy 3 Varnish instances doubling overall bandwidth in the system.

So, flexible, but can be a major way to save money at scale.

### How do I flush the Varnish cache?

(What do I do if I think varnish is hanging on to some old files? What are the perf implications to doing this? Does it flush the cache? Is that OK? When?)

If you view the response headers for any request you'll see an X-Varnish header with HIT or MISS indicated. You'll also be able to tell the relative age of the file in the cache by looking at the max age reported because Varnish adjusts the max age based on fetch time - so a page with a 1 hr expiry that's been in the cache 30 minutes will have a 30 minute max-age from Varnish.

It is ALWAYS safe to flush a varnish cache. It's supposed to happen on every deploy (most logical) but you can do it yourself with:

`$ ssh <server> 'sudo service varnish stop; sudo service varnish start'`

You can peek at Varnish's state by ssh'ing to the machine and running [varnishstat and varnishtop](https://www.varnish-cache.org/docs/3.0/tutorial/statistics.html). They're somewhat hard to grok without Google.

We have also installed the [threelegs Varnish NewRelic plugin](https://github.com/threelegs/newrelic-plugins) that monitors our production servers and graphs output from varnishstat in our New Relic dashboard.

### How does Varnish decide what gets cached?

In our apps we tell Varnish it's ok to cache something (and for how long) with:

cache_control :public, max_age:3600, ...

This says the content is public (shareable) and cachable for an hour. If we do:

cache_control :private, max_age:3600, ...

This tells Varnish this is something just for one user and it shouldn't cache it, but tells the browser IT can, for up to an hour.

There are other options for cache_control, including :none (nobody can cache the content).

In Pegasus we use max_age to selectively control the refresh rate of things like leaderboards (15 minutes) though most content we allow for an hour.
