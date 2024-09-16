### Modification

- Could you move v2/send-email to v1/send?

### Questions

- Do we need emailer.ts?
- Why do we have SCRAPE_DOT_DO_API_TOKEN_2 and SCRAPE_DOT_DO_API_TOKEN?
- do we need to change "localhost:3000" when we deploy this app?
- why is it not using "use client" in alert.tsx, button.tsx, and in card.tsx?
- Are we clearing saved data (CSV)
- Why is it passing identity twice to scraper()?
- Isn't it better to make Rate limiting random?
- Do we need to save the data locally to send it via e-mail?
- How can I set up nodemailer and how does it work?
