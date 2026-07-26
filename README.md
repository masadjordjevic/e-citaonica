# probni_proj

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_qR6UZx0CqON1h4XKvXQRWw4159c5)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

## Backend setup (Supabase)

1. Napravi besplatan Supabase projekat.
2. U Supabase SQL Editor-u pokreni `supabase/schema.sql`.
3. Kopiraj `.env.example` u `.env.local` i unesi Project URL i Publishable key.
4. U Authentication > Users ručno kreiraj naloge sa email adresama iz `lib/members.ts`.
5. Za svakog korisnika u metadata dodaj `name`, `member_key` i `avatar_url` ili ih posle izmeni u tabeli `profiles`.
6. Pokreni `npm install`, zatim `npm run dev`.

Backend rute:
- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Napomena: autentifikacija je sada serverska i koristi Supabase cookies. Ostali delovi aplikacije još koriste localStorage i prebacivaće se u bazu modul po modul.
