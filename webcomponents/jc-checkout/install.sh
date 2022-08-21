#!/usr/bin/env bash

echo ======
echo preinstall
echo

# populating devops
./initial-setup.js

# deleting old packages
rm -rf node_modules package-lock.json

echo
echo preinstall done
echo
echo installing the packages
npm i