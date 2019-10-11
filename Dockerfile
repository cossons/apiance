FROM node:8.16-alpine
LABEL maintainer="cossons"

WORKDIR apiance-client
COPY apiance-client/* ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

COPY apiance-client/* ./

EXPOSE 8080
CMD [ "npm", "run", "serve" ]
