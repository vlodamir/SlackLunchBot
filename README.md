# SlackLunchBot
Prints food from some restaurants

yes the floor is floor

## Run locally

Create a file called `.env` in the project root and fill in required variables:

```bash
NODE_ENV = dev

# Ignore Corporate Gateway certificate
NODE_TLS_REJECT_UNAUTHORIZED = "0"

ZOMATO_APIKEY = <zomato api key>

SLACK_TOKEN = <slack token>
SLACK_CHANNEL = <slack channel name>
```

run with `npm start`