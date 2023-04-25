#!/bin/bash


cd $ORCS_SYSTEM_PATH

echo "Call auto pull $(date) from $(pwd)"

remote_commit="$(git rev-parse origin/main)"
local_commit="$(git rev-parse main)"

if [ "$remote_commit" != "$local_commit" ]; then
	echo "Checkout main"
	git checkout main

	echo "Pull origin"
	git pull origin main
fi
