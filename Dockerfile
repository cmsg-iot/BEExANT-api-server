FROM node:alpine

WORKDIR /usr/src

COPY ./package.json ./

RUN npm install

COPY ./ /usr/src

RUN ls -al

CMD ["npm","start"]

