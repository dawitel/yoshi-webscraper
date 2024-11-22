# eBay Rank Checker

[demo documentation](./docs//v1/steps.md)
Scrapping the rank of each item of a specific store

# Contents

- [Diagram](#Diagram)
- [Specification](#Specification)
- [Branch](#branch)
- [Installation](#installation)
- [Development setup](#development-setup)
- [External Tools](#external-tools)
- [Future Work](#future-work)
- [Reference](#reference)
- [Directory Structure](#directory-structure)

# Diagram

![Diagram eBay Rank Checker](https://github.com/user-attachments/assets/6e2a244a-797c-4f04-9215-fa84d55d2eff)

# Specification

![Flowchart eBay Rank Checker](https://github.com/user-attachments/assets/764eb698-94b1-4726-9915-136da38d7803)
<br>

## [Explanation video](https://youtu.be/OFYwmoIBdzA) <br>

## [Example I/O file](https://docs.google.com/spreadsheets/d/1FgUaxnBNnuh9378PJOipahjW4SIHXTQ0TSbH97q6YHU/edit?usp=sharing) <br>

# Branch

Please develop features on feature/[name] branches and merge them into the dev branch. <br>
Please leave a comment to describe what you did to each commit

> master : for the production
>
> > doc : for editing README.md <br>
> > dev : for developing the app <br>
> >
> > > feature/[name] : for developing individual features <br>
> > > bugfix/[name] : for fixing bugs

# External Tools

### Proxy

- [Scrape.do](https://scrape.do/)

### Email

- [Mailtrap.io](https://mailtrap.io/)

### Domain

- [Namecheap](https://www.namecheap.com/)

### Hosting

- [Render](https://render.com/)

# Future Work

- Using the same time for input.csv and output.csv

# Reference

### Currency in JPY

![Currency in JPY](https://github.com/user-attachments/assets/7b2c8a7d-808a-4de6-b77d-80d6ec6ad6f4) <br>

### Currency in USD

![Currency in USD](https://github.com/user-attachments/assets/11172c96-2df2-48bb-818c-8ddcf8936daa)

### VPS-JP in JPY

![VPS-JP in JPY](https://github.com/user-attachments/assets/5f155f30-59c0-4c8c-8066-a4d10a2d6483)

### VPS-US in USD

![VPS-US in USD](https://github.com/user-attachments/assets/54dad4b3-1416-497f-851f-7c5eca3ddc97)

│ │ └── **mocks**
│ │ ├── test-file.csv
│ │ ├── upload.test.ts
│ │ ├── route.ts
│ └── dashboard
│ ├── page.tsx
│ ├── favicon.ico
│ ├── globals.css
│ ├── layout.tsx
│ ├── page.tsx
├── components
│ └── ui
│ ├── alert-dialog.tsx
│ ├── alert.tsx
│ ├── avatar.tsx
│ ├── button.tsx
│ ├── card.tsx
│ ├── carousel.tsx
│ ├── dropdown-menu.tsx
│ ├── form.tsx
│ ├── input.tsx
│ ├── label.tsx
│ ├── separator.tsx
│ ├── toast.tsx
│ ├── toaster.tsx
│ ├── toggle-group.tsx
│ ├── toggle.tsx
│ ├── tooltip.tsx
│ ├── email-templates.ts
│ ├── fileupload.tsx
│ ├── login.tsx
│ ├── theme-toggle.tsx
│ ├── user-button.tsx
├── hooks
│ ├── theme-provider.tsx
│ ├── use-toast.ts
├── lib
│ └── scraper
│ ├── scraper-manager.ts
│ ├── scraper-worker.ts
│ ├── scraper.ts
│ ├── emailer-v2.ts
│ ├── helpers.ts
│ ├── logger.ts
│ ├── parser.ts
│ ├── utils.ts
└── types
├── currency.ts
├── interface.ts
├── response.ts
├── .dockerignore
├── .env
├── .env.example
├── .eslintrc.json
├── .gitignore
├── components.json
├── Dockerfile
├── middleware.ts
├── next-env.d.ts
├── next.config.mjs
├── Note.md
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── tsconfig.json

```

# Directory Structure

├── final_data
│   ├── MONDAY-9-36-AM-JST.csv
│   ├── output_11-9-2024-10-55-09-PM-JST.csv
│   ├── output_11-9-2024-11-02-54-PM-JST.csv
├── public
│   ├── next.svg
│   ├── vercel.svg
├── src
│   ├── app
│   │   ├── api
│   │   │   └── v1
│   │   │       ├── auth
│   │   │       │   ├── check
│   │   │       │   │   ├── route.ts
│   │   │       │   ├── login
│   │   │       │   │   ├── route.ts
│   │   │       │   └── logout
│   │   │       │       ├── route.ts
│   │   │       ├── download
│   │   │       │   ├── route.ts
│   │   │       ├── history
│   │   │       │   ├── route.ts
│   │   │       ├── scrape
│   │   │       │   ├── route.ts
│   │   │       ├── send-email
│   │   │       │   ├── route.ts
│   │   │       └── upload
│   │   │           └── __tests__
│   │   │               └── __mocks__
│   │   │                   ├── test-file.csv
│   │   │               ├── upload.test.ts
│   │   │           ├── route.ts
│   │   └── dashboard
│   │       ├── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   ├── components
│   │   └── ui
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       ├── tooltip.tsx
│   │   ├── email-templates.ts
│   │   ├── fileupload.tsx
│   │   ├── history.tsx
│   │   ├── login.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── user-button.tsx
│   ├── hooks
│   │   ├── theme-provider.tsx
│   │   ├── use-toast.ts
│   ├── lib
│   │   ├── emailer-v2.ts
│   │   ├── helpers.ts
│   │   ├── logger.ts
│   │   ├── memo.ts
│   │   ├── parser.ts
│   │   ├── scraper.ts
│   │   ├── utils.ts
│   └── types
│       ├── currency.ts
│       ├── interface.ts
│       ├── response.ts
└── uploads
    ├── Copy of Examples for I_O - eBay Rank Checker - Input copy 2.csv
    ├── Copy of Examples for I_O - eBay Rank Checker - Input copy 3.csv
    ├── Copy of Examples for I_O - eBay Rank Checker - Input copy 4.csv
    ├── Examples for I_O - eBay Rank Checker - Small Dataset.csv
    ├── input_11-9-2024-10-37-44-PM-JST.csv
    ├── input_11-9-2024-10-44-19-PM-JST.csv
    ├── input_11-9-2024-10-52-51-PM-JST.csv
    ├── input_11-9-2024-10-59-12-PM-JST.csv
    ├── input_11-9-2024-9-24-51-PM-JST.csv
    ├── input_11-9-2024-9-29-11-PM-JST.csv
├── .dockerignore
├── .env
├── .env.example
├── .eslintrc.json
├── .gitignore
├── components.json
├── Dockerfile
├── Makefile
├── middleware.ts
├── next-env.d.ts
├── next.config.mjs
├── Note.md
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── tsconfig.json

# End Directory Structure
