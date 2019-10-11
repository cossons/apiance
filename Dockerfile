FROM node:8.16-alpine
LABEL maintainer="cossons"

WORKDIR apiance-client
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "node", "server.js" ]
