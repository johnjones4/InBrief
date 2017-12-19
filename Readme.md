# InBrief

[![Build Status](https://travis-ci.org/johnjones4/InBrief.svg?branch=master)](https://travis-ci.org/johnjones4/InBrief)
[![Maintainability](https://api.codeclimate.com/v1/badges/28160129abdf4605c5fe/maintainability)](https://codeclimate.com/github/johnjones4/InBrief/maintainability)

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

![App screenshot](screenshot.png)

## About

InBrief is a personal briefing app and dashboard powered by Node.js/React. In one screen, InBrief provides an overview of your top RSS feeds, Twitter lists, local weather, email unread and flagged status, todos, and schedule. This app is meant to be the homepage and daily starting place for its users.

Each widget on the app's screen draws its data via various APIs, and InBrief is designed to support future widgets and APIs as is necessary or desired. The current supported services/APIs are:

* ICS calendar feeds
* Microsoft Exchange Web Services calendars
* Microsoft Exchange Web Services email
* IMAP email (including GMail)
* RSS/Atom
* Todoist
* Asana
* Twitter
* Weather Underground

## Setup

1. Within both the `client` and `server` folders, run `npm install` to install Node.js dependencies.
2. Run `npm build` within the `client` folder.
3. Copy `config.sample.json` to `config.json` within the `server` folder. The `config.json` file is organized as a map of widget class names to configuration parameters.
4. Update the properties in `config.json` to meet your configuration needs. If you do not want to use a particular widget, delete that section of `config.json`.
5. Start the server by running `node index.js` within the `server` folder. Express will begin listening at port 8080. (Set the `PORT` environment variable to listen on another port.)

## Deploying With Docker

You can deploy this via Docker by running `docker build ./`. There is also a Makefile included that builds and deploys InBrief to a server running Docker.
