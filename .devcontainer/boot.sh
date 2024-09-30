bundle install
. ${NVM_DIR}/nvm.sh && nvm install --lts
yarn install

cd activerecord

MYSQL_CODESPACES=1 bundle exec rake db:mysql:rebuild