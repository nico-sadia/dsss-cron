# Daily Spotify Song Saver (cron job service)

- This is an automated Node.js + Typescript service that connects to the Spotify API to fetch a user's recently played tracks and then saves them to a [Supabase](https://supabase.com/) PostgreSQL database. It uses [cron-job.org](https://cron-job.org/en/) to hit endpoints hosted on an Express server hosted by [Render](https://render.com/).
