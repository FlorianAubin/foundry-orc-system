#!/bin/bash

echo "Call auto pull $(date)"

remote_commit="$(git rev-parse origin/main)"
local_commit="$(git rev-parse main)"

if [ "$remote_commit" != "$local_commit" ]; then
	echo "Checkout main"
	git checkout main

	echo "Pull origin"
	git pull origin main
fi
