FROM node:16.13.1-alpine
WORKDIR /usr/app
COPY package.json .
RUN apk update && apk add bash
RUN npm install --quiet
COPY . .