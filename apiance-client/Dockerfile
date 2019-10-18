FROM node:8.16-alpine
LABEL maintainer="cossons"

WORKDIR /apiance-client
COPY . .

RUN npm install

EXPOSE 8080
CMD [ "npm", "run", "serve" ]
