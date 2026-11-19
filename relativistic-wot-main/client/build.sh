#docker build --no-cache -t hyperloris/images:gluzzi-front-staging_$1 .

docker build -f Dockerfile -t hyperloris/images:gluzzi-front-staging_$1 .
docker push hyperloris/images:images:gluzzi-front-staging_$1

docker build -f Dockerfile-production -t hyperloris/images:gluzzi-front_$1 .
docker push hyperloris/images:gluzzi-front_$1
