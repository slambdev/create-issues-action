#!/bin/sh -l
cd /
npm ci --only=production
npm start
