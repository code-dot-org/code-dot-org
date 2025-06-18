# Architectural Tenets

<p style="font-size: 120%;">
  <b>TL;DR:</b> work done at code.org should live in the code-dot-org monorepo, be deployed in a container as part of one of our existing monoliths, be integration tested by our central CI system prior to PR merge, use REST for client/server communication, default to "The Rails Way", prefer 3rd party managed services that implement Open Source Protocols/APIS, and be implemented using Ruby/Rails/JS/TS/React/MySQL.
</p>

1. If somebody proposes a design counter to these tenets, please direct them to [this link](ARCHITECTURE.md#architectural-tenets) to this section of this file. Better yet: link them straight to the relevant tenet(s) below.
2. If these tenets become outdated, they should either be amended publicly or deleted.
3. If this file is still in the repo, its rules are still in effect.

The goal of the tenets is not to maintain an exhaustive or  current list of technical requirements, but to highlight a small set of **core architectural choices we rarely break**  and rarely change. These architectural tenets are intentionally limited: they were mostly true in 2014, are mostly true today, and might even end up mostly true in 2034. Think “constitution” not “laws”: its important they are amended to fit the times, but only rarely. Less is more.

## The tenets represent tradeoffs

The tenets may be different than you are familiar with in commercial orgs where unbounded staff growth can often be assumed. They work together so our permanently small team can make technical progress both today AND in the long-term. They balance inherent tradeoffs between “personal dev velocity today” and “collective dev velocity years from now”.

Examples:

| Collective Benefit Tomorrow | Trade Off Today |
| :---- | :---- |
| **“If my PR passes  CI it won’t break code.org”** | “CI is slow” |
| **“I  can implement features/refactors that require changes across the codebase: even in areas I didn’t know about before (even if nobody knows about them anymore)”** | “I have to work inside the monorepo even if it’d be so much faster to deliver this quarter’s feature goals by spinning out my own repo without the overhead” |
| **“After mastering a few key technologies I can work in almost any part of the codebase”** | “Even if hotnewframework is the very best option in 2120, it might be best if I use existingokframework from 2115 because we already use it widely and it gets the job done just fine.” |

Historical violations of almost all tenets exist, and are not a priority to fix. However, these should not be interpreted as an invitation to follow suit. A strong majority of historical code already adheres to all the tenets, which is part of why they were picked in the first place.

---

### Tenet 1: Well-structured monorepo (vs. multiple repos)

We organize our code as a single “monorepo” in Github vs. having multiple repos with dependencies between each other. Your contributions should live inside this repo.

<details>
  <summary>Why?</summary>

  * A monorepo makes it much easier to do large refactors in dynamically typed languages via search/replace: after you craft your regex searches, its good to know you were searching the whole space of potentially affected files.
  * A monorepo makes it much easier to implement uniform tooling across modules/libraries/systems/folders, which increases the confidence that “After mastering a few key technologies I can work in almost any part of the codebase”.
  * See the “Collective Benefit Tomorrow” table above, most of those are enabled by the complementary combination of Monorepo+Monolith+CI.  
    * For example it’s **much** easier to implement integration tests in a monorepo and over the long term things that are easy are things that tend to happen, which gives you “If my PR passes  CI it won’t break code.org”  

</details>

<details>
  <summary>Exceptions</summary>

  * 3rd Party Libraries we have forked (e.g., Google Blockly)  
  * Gems and NPMs we published that already have 3rd party traction  
    * While we encourage releasing code as standalone open source packages hosted **within** the monorepo, please demonstrate significant 3rd party usage/interest/strategy before splitting the package out of the repo. Historically we’ve split first and then not gotten traction which resulted in lots of “eggs” (things outside the repo) but no “chickens” (3rd party uptake of our packages).

</details>

### Tenet 2: Monolith (vs. microservices)

We deploy code.org as a couple monoliths (vs many microservices). Your contributions should extend one of our existing monolith services: dashboard (studio.code.org), our cms (code.org), or our activejob workers. They should NOT create a new service. This list of monoliths should rarely (if ever) change.

<details>
  <summary>Why?</summary>

  * See: [The Majestic Monolith](https://signalvnoise.com/svn3/the-majestic-monolith/) by DHH for why monolith and [Microservices](https://www.youtube.com/watch?v=y8OnoxKotPQ) video by KRAZAM for why not microservices.
  * Also see tenet below: “The Rails Way”.
  * A monolith gives us a single uniform predictable deploy step: if I merge this PR here/now, I know when and how my code will be deployed, no matter what part of the codebase I changed.  
  * Avoids having to coordinate rollouts, esp in cases where old code may be using a very old or under documented deploy system.  
  * Microservices tend to improve dev productivity when you “horizontally scale” the number of devs and in the short-term to make small changes or new standalone services and when you have firm ownership boundaries, but decrease dev productivity when you want to “vertically scale” a small number of devs and in the long-term when you need to own a lot of code made by people in the past and when you want collective/fuzzy ownership boundaries.  
    * In our situation we have a fixed+small horizontal scale AND we keep old code around for a long-time but still want to make occasional changes to it with confidence AND we prefer collective ownership.  
  * See the “Collective Benefit Tomorrow” table above, most of those are enabled by the complementary combination of Monorepo+Monolith+CI. E.g. “If my PR passes  CI it won’t break code.org” requires coordination of both testing across repos but ALSO coordinated deployment which can be tricky with microservices.

</details>

<details>
  <summary>Exceptions</summary>

  * If it’s *fundamentally* harder for inviolable technical reasons you can consider a microservice. Wanting to use a new language is not a valid reason to deploy as a microservice unless use of that language is fundamentally required to achieve the feature (e.g. javabuilder inherently needs to use javac running on java, and is required because the feature goal was teaching java).  
  * This doesn’t restrict use of 3rd party services or open source servers e.g. its ok to deploy a redis instance or use a managed redis service (better). If we don’t “own the code”, it’s ok to stand up an instance.

</details>

### Tenet 3: Continuous Integration of All Parts (vs. only decoupled unit based testing)

TL;DR: for folks working inside existing folders and systems this just means: your work should be covered by UI and/or other integration tests (and they should probably run as part of the main CI build).

If you are extending our main .rake CI system or adding a parallel CI: all work in the code-dot-org repo should be continuously integration tested against its in-repo consumers prior to merging a PR. Litmus test: if somebody is working on a library or service, and they break a downstream user of your lib/service within the repo (whether unit or UI tests), unless it’s very technically challenging, your CI setup must be structured to fail their work prior to PR merge. The easiest way to accomplish this is to tie your build/test loop into the main rake-based CI system.

<details>
  <summary>Why?</summary>

  * Gives long-term confidence that changing any part of our codebase (even ones forgotten years ago) will be flagged before PR merge by our CI system. Allows a team to confidently work on ALL parts of the codebase.  
  * Prevents accidental forks where multiple consumers of the same lib will change it not knowing the change breaks other consumers, and nobody will notice for months/years by which point nobody has time to unpin the de facto fork.  
  * Catches build errors before they’re merged so they can be fixed by the author rather than DOTD hunting down “whodoneit” a day/week/whatever later.  
  * See the “collective benefit tomorrow” tradeoff chart, most of those are enabled by the complimentary combination of Monorepo+Monolith+CI

</details>

<details>
  <summary>Exceptions</summary>

  * Chef Cookbooks: we don’t test these as part of our main CI build because it would be *very* technically challenging to do so as it requires modifying actual server instances.  
  * Non-exceptions: if your goal is bypassing “slow main CI tests” this tenet *probably* means you can’t unless you have no downstream consumers of your lib/service, or you can do full integration testing against all parts without running the whole test suite. Alternaive idea: consider optimizing our overall CI suite performance.

</details>

### Tenet 4: Ruby/Rails/React/MySQL (vs infinite language and framework possibilities)

Prefer Ruby/Rails/MySQL on the server side and JS/TS/React on the client side. Prefer Ruby/Rake for general tooling (infra, build, etc) and nodejs for JS/TS-related tooling. Most code.org work should be implemented with these core technologies.

<details>
  <summary>Why?</summary>

  * We generally have simple "rails shaped", "mysql shaped" and "react shaped" problems that aren't very exotic and don't benefit significantly from exotic solutions.
  * We have a significant investment in Ruby/Rails that makes it challenging to do a wholesale move to a different platform.
  * We get productivity benefits from being a monolith, which means sticking with the same basic language + web framework.
  * Ruby/Rails is working well. While other platforms (e.g., Go) may be more optimized/efficient, they don’t outweigh the effort that would be required to move.
  * A single Ruby/Rails server-side architecture makes it easier for team members to move between different parts of the code base.
  * We don't have sections of the code "go dark" when contributors leave the project taking with them the last knowledge of relatively obscure technology.
  * A good general principle for code.org: given our problem space, we should usually be making pretty boring technology choices.

</details>

<details>
  <summary>Exceptions</summary>

  * When it is fundamentally impossible to implement a specified feature without using another language, e.g. Javabuilder uses Java because our curriculum goal required running Java code, which inherently requires Java.
  * If it is not feasible to implement a feature in Ruby due to lack of libraries, Python may be invoked from ActiveJob ([howto](https://github.com/code-dot-org/code-dot-org/tree/staging/python)).
  * May use *short* snippets of inline JS/JQuery *without* React on the client side, where pragmatic.
  * May use bash or nodejs for general tooling when pragmatic (e.g. better nodejs apis than ruby)
  * Consider Redis instead of MySQL when performance is important and ephemerality is acceptable (e.g. cache values)
  * This tenet will probably have more exceptions and edge cases than most. Its not an exhaustive list, its a "highly preferred list".
    * Be pragmatic, do a good faith attempt to use preferred languages and frameworks, but solve your problems.
    * E.g. we also use cloudformation (etc etc) which could be argued to be kind of like a programming language, but is **totally** not a problem.
      * OTOH, you don't get to "use Haskell because everything else should be considered lame and fundamentally broken" 😉.

</details>

### Tenet 5: “The Rails Way” (vs. overfitting to today’s needs)

Prefer the conventional Rails way to accomplish a task: it might be better to be 100% conventional than get a 10% gain by deviating from convention. This is not a “don’t do it”, more like a “think twice if you really need to before doing it”.

General thoughts on the Rails approach can be found at https://rubyonrails.org/doctrine with more specific advice for "how do to X the rails way" at https://guides.rubyonrails.org/. If you're not familiar with Rails, a course or a book might be helpful.

<details>
  <summary>Why?</summary>

  * Observing the codebase over a decade of dev: sometimes you can get a gain this year by customizing Rails to work a different way that’s a little better for us, but over time non-conventional code tends to become a maintenance burden.  
  * Often the “10% better” non-conventional code is exactly what prevents us from upgrading to the “50% better” official Rails solution to the problem that comes out 2 years later.  
  * By and large we have pretty conventionally Rails-shaped problems, which means Rails tends to solve our problems better than we would if we wait a little longer.  
  * Rails has been a great long-term fit to our problem space and we benefit from continuing to get upgrades as Rails has improved. Doing it “their way” makes upgrades happen semi-automatically.

</details>

<details>
  <summary>Exceptions</summary>

    * Sometimes deviating from stock Rails makes sense due to the large size of our application:
      * e.g. modularizing our rails app via [Rails engines](https://guides.rubyonrails.org/engines.html).
      * e.g. decoupling rails routes from being associated with individual models.

</details>

### Tenet 6: Managed Services that implement an Open Source Protocol / API (vs proprietary managed services or self-hosted open source services)

When making technical selections, prefer managed services that implement an Open Protocol or an Open Source API. For example, we don’t host our own MySQL instance, but we ALSO don’t use ProprietarySQLDB(TM). Instead, we use a 3rd party managed service that implements the MySQL protocol.

<details>
  <summary>Why?</summary>

  * Gives us the best of both worlds:
    * Self-hosting many open source servers, especially stateful services like DBs, requires ongoing infra admin work and monitoring attention. We have a small team.  
    * Developing against an API with an Open Source implementation gives us flexibility:  
      * …to implement a “local dev” for the service using the open source version  
      * …to change vendors if need be (cost, availability, in-kind donations, etc)  

</details>

### Tenet 7: Use REST (vs. GraphQL) for APIs

As we add APIs for our platform, we will publish them using REST. Client-side apps should communicate with the server using REST endpoints.

<details>
  <summary>Why?</summary>

  * KISS: REST has been a simple and an effective match to our needs.  
  * Our labs and other fat client-side JS apps don’t tend to have the “complex aggregation of dynamic data from many sources” property that benefits from more complex systems like GraphQL.  
  * REST APIs inherently support HTTP caching mechanisms (e.g., ETag, Last-Modified, Cache-Control), enabling better performance and reducing load on the server.

</details>

### Tenet 8: Containers (vs. Chef/scripts for deployments)

We will move towards deploying our code using containers over further investing in other deployment mechanisms (either Chef or custom scripts).

<details>
  <summary>Why?</summary>

  * Provides a common deployment and development pattern across our engineering teams.  
  * Decreases the work required to port our services between cloud providers  
  * Easier to build a local dev environment that effectively mimics prod

</details>

<details>
  <summary>Exceptions</summary>

  * Any storage layer in production (e.g., MySQL/RDS/S3) should not be containerized.  
  * We will still rely on vendor-specific templates for infrastructure configuration (e.g., Cloud Formation)  
  * Scripts can still be helpful to make complex multi-step operations easier/clearer

</details>

---

### ⬆️ Above ⬆️ this line live the architecutral tenets. They should be kept at the top of the file and edited sparingly.

### ⬇️ Below ⬇️ this line is general architecture information: please edit freely!

---

# Code.org's Overall Architecture...

Overview of our architecture goes here, please fill me in!