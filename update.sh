#!/bin/sh

yarn build || exit 1
git add .
git commit -m '...'
git push origin beta