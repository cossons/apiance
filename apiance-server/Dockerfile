FROM node:8.16-alpine
LABEL maintainer="cossons"

WORKDIR /apiance-server
COPY . .

RUN npm install

EXPOSE 3000
CMD [ "npm", "run" ]
