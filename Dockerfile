FROM node:16.18.0

ENV USER=xland

# install python and make
RUN apt-get update && \
	apt-get install -y python3 build-essential && \
	apt-get purge -y --auto-remove
	
# create xland user
RUN groupadd -r ${USER} && \
	useradd --create-home --home /home/xland -r -g ${USER} ${USER}
	
# set up volume and user
USER ${USER}
WORKDIR /home/xland

COPY package*.json ./
RUN npm install
VOLUME [ "/home/xland" ]

COPY . .

ENTRYPOINT [ "node", "index.js" ]
