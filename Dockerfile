FROM node:14-alpine

COPY . /

RUN ls /

RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]