FROM node:14-alpine

COPY . /

RUN ls

ENTRYPOINT ["/entrypoint.sh"]
