USE font_ninja;

CREATE TABLE IF NOT EXISTS app_health_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  url_hash BINARY(32) GENERATED ALWAYS AS (UNHEX(SHA2(url, 256))) STORED,
  publication_date DATETIME NULL,
  source VARCHAR(255) NOT NULL
);

CREATE UNIQUE INDEX ux_articles_url_hash ON articles (url_hash);
CREATE INDEX idx_articles_publication_date_id ON articles (publication_date DESC, id ASC);

CREATE TABLE IF NOT EXISTS scrappers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scrapper_id INT,
  date_status_change DATETIME,
  state ENUM('run', 'pause', 'error')
);

INSERT INTO app_health_log (service_name, status)
VALUES ('font-ninja-backend', 'initialized');
