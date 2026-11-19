# build stage
FROM node:16.13.0-alpine3.11 AS build
WORKDIR /usr/src/app
COPY package.json $WORKDIR
RUN npm install -f
COPY . .
#RUN npm run build
RUN $(npm bin)/ng build --prod

EXPOSE 80

# run stage
FROM nginx:1.19.0-alpine
#COPY /nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist/relativistic-client /usr/share/nginx/html
