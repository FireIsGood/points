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

Edit the `admin_key` to your own secret.

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
