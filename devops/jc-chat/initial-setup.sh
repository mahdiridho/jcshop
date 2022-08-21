#!/usr/bin/env bash

# is the answer match to the option list
function checkOption {
  local foundItem=false
  for o in $2; do
    if [ "$o" == "$1" ]; then
      foundItem=true
      break
    fi
  done
  echo $foundItem
}

# question the user for a choice
# \param $1 the env variable to set on success
# \param $2 the question to ask
# \param $3 the list of options
# \param $4 the default answer if provided
# \returns env var $1 is set to the user's answer
function Question {
  whichVal=''
  while [ -z "$whichVal" ]; do
    for p in $3; do
      echo $p
    done

  	echo
  	echo $2
  	read result

    whichVal=`echo $3 | grep "$result"`
  done
  local answer=$1
  if [ "$result" != '' ]; then
    # matching the answer to the option list
    option=$(checkOption "$result" "$3")
    if $option; then
      eval $answer="'$result'"
    else
      Question "$1" "$2" "$3" "$4"
      return
    fi
  else
    # if 4th arg exists, set is as the default answer
    # otherwise loop the question
    if [ "$4" != '' ]; then
      eval $answer="'$4'"
    else
      Question "$1" "$2" "$3"
      return
    fi
  fi
  echo
}

# does aws credential profile file exist?
if [ ! -f ~/.aws/credentials ]; then
  echo "The AWS credentials file (~/.aws/credentials) doesn't exist!"
  echo "Setup your credentials file for the AWS cli command : https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html"
  exit
fi

# run this to setup your profile, your functions region
echo Checking various parameters for offline function execution

echo Setting up your profile
profiles=`aws configure list-profiles`
Question profile "Which AWS profile is the system under (or leave empty for default profile)?" "$profiles" "default"

echo Setting up the function region
regions=`aws --profile ${profile} --region us-east-1 ec2 describe-regions | grep RegionName | awk '{print $2}' | sed 's/,//g;s/"//g'`
Question region "Which region is the lambda function running in (or leave empty for us-east-1)?" "$regions" "us-east-1"

echo Setting up the dynamodb table
tables=`aws --profile ${profile} --region ${region} dynamodb list-tables | grep '        "' | awk '{print $1}' | sed 's/,//g;s/"//g'`
Question table "Which Table triggers the Lambda function ?" "$tables"

echo Setting up your aws profile Id
profileId=`aws --profile ${profile} sts get-caller-identity --query Account --output text`

echo Setting up the project name
projectName=`echo $table | sed 's/_dynDB$//'`

configStr="{
  \"profile\": \"${profile}\",
  \"region\": \"${region}\",
  \"table\": \"${table}\",
  \"profileId\": \"${profileId}\",
  \"projectName\": \"${projectName}\"
}"

echo "$configStr"

echo "$configStr" > ./function/config.json