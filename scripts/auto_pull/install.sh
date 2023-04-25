#!/bin/bash

cat crontab.entry >> /var/spool/cron/crontabs/$USER
cat .env >> /etc/environment
