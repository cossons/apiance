FROM node:8.16-alpine
LABEL maintainer="cossons"

COPY apiance-client apiance-client
COPY apiance-server apiance-server
COPY entrypoint.sh /entrypoint.sh

RUN cd apiance-client && npm install && cd ..
RUN cd apiance-server && npm install && cd ..


# If you are building your code for production
# RUN npm ci --only=production


EXPOSE 8080
CMD [ "/entrypoint.sh" ]
