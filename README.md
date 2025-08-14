## Introduction

A script to generate images using Amazon Bedrock's Image Models. Project name inspired by 'The Artist' from Fredrik Backman's book - My Friends.

## Tech Stack

- NodeJS script
- Yarn for package management
- AWS SDK v3 to interface with Bedrock

## Running the script

### Install Dependencies
```sh
yarn
```

### Set up AWS Credentials locally

- First, define your profiles for the SSO process
- Run the SSO login command and store credentials in current session
```sh
aws sso login --profile <profile-name> && aws configure export-credentials --profile <profile-name> --format env | pbcopy && $(pbpaste)
```

### Run the local script
```sh
yarn run main-local
```
