#!/usr/bin/env bash

# stops script if any simple command fails
set -e
# make sure we have fresh link
npm cache clean --force
yalcDir=`yalc dir`
rm -rf $yalcDir/packages/@jcshop/jc-checkout $yalcDir/packages/@jcshop/jc-chat

find . \( -name 'node_modules' \) -or \( -name 'package-lock.json' \) -or \( -name 'yalc.lock' \) -or \( -name '.yalc' \) | xargs rm -rf
requirements="jc-checkout jc-chat"
for r in $requirements; do
  pushd $r;
  ./install.sh;
  yalc publish;
  popd
done
