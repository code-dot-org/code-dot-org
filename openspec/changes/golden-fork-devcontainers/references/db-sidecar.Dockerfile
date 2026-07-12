FROM mysql:8.0

# Bake the pre-seeded, cleanly-shut-down datadir directly into image layers
# (non-VOLUME path) so container start = mysqld boot only, no volume attach/copy.
# mysql:8.0 (Docker Official) runs mysqld as uid:gid 999:999, matching the
# datadir's existing ownership (Debian mysql-server also used 999:999).
ADD --chown=999:999 mysql-data.tar /opt/mysql-data/

ENTRYPOINT ["mysqld"]
CMD ["--datadir=/opt/mysql-data", \
     "--skip-log-bin", \
     "--mysqlx=OFF", \
     "--innodb-flush-log-at-trx-commit=0", \
     "--skip-innodb-doublewrite", \
     "--innodb-buffer-pool-size=256M", \
     "--bind-address=0.0.0.0"]
