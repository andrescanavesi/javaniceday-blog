# javaniceday.com blog
javaniceday.com blog

# Set up environment
Create an `.env` file from `.env.example` and complete the missing values

`cp .env.example .env`

# Commands

```bash
npm run dev
npm start
npm test
```

Open `http://localhost:3000`

# See logs in Heroku
```bash
heroku logs --tail -a javaniceday-blog-staging
```

# Set env vars in heroku
```bash
heroku config:set -a javaniceday-blog-staging NODE_ENV=staging 
heroku config:get -a javaniceday-blog-staging NODE_ENV
```

# Set all env vars in Heroku from .env file (WARNING: it will override all!)
`heroku config:set -a javaniceday-blog-staging $(cat .env | sed '/^$/d; /#[[:print:]]*$/d')`

