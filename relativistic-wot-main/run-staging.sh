docker-compose -f docker-compose-staging.yml down
cp -r ./simulator room/
# docker-compose -f docker-compose-staging.yml build --no-cache
# docker-compose -f docker-compose-staging.yml build
docker-compose -f docker-compose-staging.yml up --remove-orphans
rm -r ./room/simulator
