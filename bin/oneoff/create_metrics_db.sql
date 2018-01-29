/* script used to manually create metrics table on dev-internal db */
CREATE TABLE metrics
(
    id INT NOT NULL AUTO_INCREMENT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(512) NOT NULL,
    metadata VARCHAR(512),
    value double,
    PRIMARY KEY (`id`),
    KEY `index_metrics_on_name` (`name`) USING BTREE,
    KEY `index_metrics_on_metadata` (`metadata`) USING BTREE
) ENGINE=InnoDB;
