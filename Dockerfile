FROM node

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . .

RUN npm install -g -s -f --no-progress yarn && \
    yarn && \
    yarn cache clean

EXPOSE 3000

CMD [ "yarn", "start:prod" ]