FROM node:14-alpine

COPY . /

RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]