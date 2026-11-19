cp -r ./simulator room/
# docker-compose build --no-cache
docker-compose build
docker-compose up --remove-orphans
rm -r ./room/simulator
