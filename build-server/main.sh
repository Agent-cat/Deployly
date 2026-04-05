#! /bin/bash

export GIT_REPOSITORY_URL="$GIT_REPOSITORY_URL"  # $[name]----> Getting From ENV

# Clone the project from git in  /home/app/output
git clone "$GIT_REPOSITORY_URL" /home/app/output

exec node script.js
