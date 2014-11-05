# How to update level builder
* `ssh levelbuilder.code.org`
* `cd levelbuilder`
* `git checkout -b levelbuilder`
* `git add .`
* `git commit -m "level builder changes"`
* `git push origin levelbuilder`
* `# handle the merge via git hub UI`
* `git checkout staging`
* `git pull`
* `rake build:dashboard`

These steps will:
* commit level builder changes
* push latest staging changes to levelbuilder.

More advanced instructions [here](https://docs.google.com/a/code.org/document/d/1HcYloRHibxk0Axnuw3A3w_Ht3AEmBHO0IUCaYFfs838/edit#heading=h.ihuilew1afmk).
