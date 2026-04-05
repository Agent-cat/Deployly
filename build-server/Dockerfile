FROM ubuntu:focal

RUN apt-get update
RUN apt-get install -y curl

# Install Node JS
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs

# Install Git
RUN apt-get install git -y

WORKDIR /home/app

# Copy main.sh script.js and package*.json
COPY main.sh main.sh
COPY script.js script.js
COPY s3-client.js s3-client.js
COPY package*.json ./

RUN npm install


# Make them Executable
RUN chmod +x main.sh
RUN chmod +x script.js

# It runs When the Container is created
ENTRYPOINT [ "/home/app/main.sh" ]
