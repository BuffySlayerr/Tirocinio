FROM node:12.16.1-alpine3.11 as BUILD

COPY package.json .
RUN npm install
COPY . .

EXPOSE 8080
RUN npm run build
CMD ["npm", "run", "start"]
