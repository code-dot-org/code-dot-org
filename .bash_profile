
ulimit -n 8192

# Load nvm function into the shell
export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh

eval "$(rbenv init -)"

# Show current git branch in command line
parse_git_branch() {
   git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}
export PS1="\[\033[32m\]\w\[\033[33m\]\$(parse_git_branch)\[\033[00m\] $ "

. "$HOME/.local/bin/env"
export PATH="/usr/local/opt/mysql@8.0/bin:$PATH"
