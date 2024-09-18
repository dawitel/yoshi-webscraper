# Notes for me

## Fix

- Rank is not correct - solved

## Modification

- Could you move v2/send-email to v1/send? - solved
- Could you delete the oldest data in final_data once we get more than 10 dataset in the folder
- Isn't it better to make Rate limiting random?

## Questions

- Do we need emailer.ts? - No we dont it.
- Why do we have SCRAPE_DOT_DO_API_TOKEN_2 and SCRAPE_DOT_DO_API_TOKEN? to rotate proxy servers
- do we need to change "localhost:3000" when we deploy this app? no we dont
- why is it not using "use client" in alert.tsx, button.tsx, and in card.tsx? they are ui components
- Are we clearing saved data (CSV) No but we can.
- Why is it passing identity twice to scraper()? fixed it was a bug
- Isn't it better to make Rate limiting random? yes it is.
- Do we need to save the data locally to send it via e-mail? we are not saving the data locally for a long period of time it was just temporary. after we send it we will delete it imediately.
- How can I set up nodemailer and how does it work?
