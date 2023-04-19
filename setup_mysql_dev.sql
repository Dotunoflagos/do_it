-- prepares a MySQL server for the project

CREATE DATABASE IF NOT EXISTS doit_dev_db;
CREATE USER IF NOT EXISTS 'doit_dev'@'localhost' IDENTIFIED BY 'Doit1_dev2_p!wd';
GRANT ALL PRIVILEGES ON `doit_dev_db`.* TO 'doit_dev'@'localhost';
GRANT SELECT ON `performance_schema`.* TO 'doit_dev'@'localhost';
FLUSH PRIVILEGES;

-- HBNB_MYSQL_USER=doit_dev HBNB_MYSQL_PWD='Doit1_dev2_p!wd' HBNB_MYSQL_HOST=localhost HBNB_MYSQL_DB=doit_dev_db HBNB_TYPE_STORAGE=db HBNB_API_HOST=0.0.0.0 HBNB_API_PORT=5001 HBNB_LINK=dev python3 -m api.v1.app
-- HBNB_MYSQL_USER=doit_dev HBNB_MYSQL_PWD='Doit1_dev2_p!wd' HBNB_MYSQL_HOST=localhost HBNB_MYSQL_DB=doit_dev_db HBNB_TYPE_STORAGE=db HBNB_API_HOST=0.0.0.0 HBNB_API_PORT=5000 HBNB_LINK=dev python3 -m web_dynamic.doit
-- cat setup_mysql_dev.sql | mysql -hlocalhost -uroot -p
-- sudo service mysql restart