# InBrief

[![Build Status](https://travis-ci.org/johnjones4/InBrief.svg?branch=master)](https://travis-ci.org/johnjones4/InBrief)
[![Maintainability](https://api.codeclimate.com/v1/badges/28160129abdf4605c5fe/maintainability)](https://codeclimate.com/github/johnjones4/InBrief/maintainability)

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

![App screenshot](screenshot.png)

## About

InBrief is a personal briefing app and dashboard powered by Electron and React. In one screen, InBrief provides an overview of your top RSS feeds, Twitter lists, local weather, email unread and flagged status, todos, and schedule. This app is meant to be the homepage and daily starting place for its users.

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

## Installation

When InBrief launches for the first time, it creates a `.inbriefrc.json` file in your home directory. Update the contents of that JSON file per the [example file](https://github.com/johnjones4/InBrief/blob/electronapp/inbriefrc.sample.json) and restart InBrief.
