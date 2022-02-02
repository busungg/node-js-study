docker run --rm -d --name testdb -e MYSQL_ROOT_PASSWORD=1 -p 127.0.0.1:3306:3306 mysql
docker run --rm -d --name testdb -e MYSQL_ROOT_PASSWORD=1 -p 3306:3306 -v testdb:/var/lib/mysql mysql

docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:tag

--rm -d 무슨용도인지 확인
