FROM node

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production


COPY . .

RUN npm ci --only=production


EXPOSE 3000

CMD [ "npm run", "start:prod" ]



