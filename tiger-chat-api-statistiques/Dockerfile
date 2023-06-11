FROM node:19-alpine3.16

RUN npm install -g nodemon

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5501

CMD ["npm" , "start"]