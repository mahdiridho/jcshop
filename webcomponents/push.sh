#!/usr/bin/env bash

echo
echo yalc push packages
echo

function getPackageName() {
  packageName=`sed -n 's|"name": ||p' $1/package.json | sed 's|.*"\(.*\)",.*|\1|'`
  echo $packageName
}

# yalc push on the root package
echo push root package
yalc push
echo

# get root package
package=`getPackageName $(pwd)`

# get the yalc system directory
yalcDir=`yalc dir`

echo ---------
echo push nested packages
echo ---------
function pushNestedPackages() {
  # show the nested childs
  childPackages=$(yalc installations show $package)
  # needed infos started from the 2nd line
  childPackages=$(echo "$childPackages" | sed -r -e "s|Installations of package $package:||g")
  # parse to lines
  for c in $childPackages; do
    echo
    # get the top path of nested child
    c=`echo "$c" | sed 's|/.yalc.*||; s/\b*$//'`
    echo Path: $c
    # get the package name of nested child
    package=`getPackageName $c`
    echo Package Name: ${package}
    if [ ! -d ${yalcDir}/packages/${package} ]; then
      echo "Not a local package"
    else
      echo yalc push package
      pushd $c
        yalc push
      popd
      pushNestedPackages
    fi
  done
}

pushNestedPackages