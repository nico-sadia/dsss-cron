# Daily Spotify Song Saver - Backend

The Express.js and TypeScript backend for Daily Spotify Song Saver, a project that saves a user's most-played track from the previous day to a selected Spotify playlist.

## How it works

- Handles Spotify API requests and OAuth token management.
- Stores user and listening data in Supabase PostgreSQL, and refreshes expired access tokens.
- Receives scheduled requests from cron-job.org, collects recent plays, identifies the most-played track and adds it to the user's selected playlist.

## Technologies

TypeScript · Node.js · Express.js · Spotify Web API · Supabase · PostgreSQL

## Project status

This was built as a personal project. Its current availability may be affected by Spotify's developer access requirements.
