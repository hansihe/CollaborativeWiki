FROM ubuntu:latest
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup | sudo bash -
RUN apt-get install -y nodejs
RUN npm install gulp -g
ADD . /src
WORKDIR /src
RUN npm install
