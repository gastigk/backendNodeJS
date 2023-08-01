FROM node

COPY . .

RUN npm install

RUN npm uninstall bcrypt

RUN npm i bcrypt

EXPOSE 8080

CMD ["npm", "start"]

