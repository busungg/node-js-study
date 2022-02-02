docker run --rm -d --name testdb -e MYSQL_ROOT_PASSWORD=1 -p 127.0.0.1:3306:3306 mysql
docker run --name testdb -e MYSQL_ROOT_PASSWORD=1 -p 3306:3306 -v testdb:/var/lib/mysql mysql

docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:tag

--rm -d 무슨용도인지 확인

--rm: 컨테이너 종료 시 자동 삭제 옵션.
