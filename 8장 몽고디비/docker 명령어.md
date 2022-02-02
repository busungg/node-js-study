docker run --name testmongodb -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=root -p 127.0.0.1:27017:27017 mongo
docker run --rm -d --name testmongodb -e MONGO_INITDB_ROOT_USERNAME=root,MONGO_INITDB_ROOT_PASSWORD=root -p 127.0.0.1:27017:27017 mongo
docker run --name testMongodb -p 27017:27017 -d mongo
