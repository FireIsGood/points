# FireIsPoints

Personal point tracker to my very specification.

## Local Development

Install dependencies with your preferred package manager:

```bash
pnpm i
```

Add the `.env` file:

```bash
cp .env.example .env
```

In the new `.env` file, replace the `admin_key` value to be a bcrypt hash of
an admin key. You will use the unhashed version to authorize on the frontend

Update and run Drizzle migrations:

```bash
pnpm generate-migrations:db
pnpm migrate:db
```

Run the development server:

```bash
pnpm run dev
```

## Building

To build the production version:

```bash
npm run build
```

To preview the build:

```bash
npm run preview
```

Load the production app at port 3000:

```bash
node build
```
