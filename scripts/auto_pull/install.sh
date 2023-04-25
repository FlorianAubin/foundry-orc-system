#!/bin/bash

cat crontab.entry >> /var/spool/cron/crontabs/__USER__
cat .env >> /etc/environment
