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
  publication_date DATETIME NULL,
  source VARCHAR(255) NOT NULL
);

INSERT INTO app_health_log (service_name, status)
VALUES ('font-ninja-backend', 'initialized');
