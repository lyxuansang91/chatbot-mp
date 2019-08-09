#!/bin/bash
pm2 delete all

git fetch origin develop && git reset --hard origin/develop

yarn start