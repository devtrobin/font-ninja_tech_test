USE font_ninja;

CREATE TABLE IF NOT EXISTS app_health_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_health_log (service_name, status)
VALUES ('font-ninja-backend', 'initialized');
