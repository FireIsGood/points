# FireIsPoints

Personal point tracker to my very specification.

## Local Development

Install dependencies with your preferred package manager:

```sh
pnpm i
```

Add the `.env` file:

```sh
cp .env.example .env
```

Edit the `admin_key` to your own secret.

Update and run Drizzle migrations:

```sh
pnpm generate-migrations:db
pnpm migrate:db
```

Run the development server:

```sh
pnpm run dev
```

## Building

To build the production version:

```sh
npm run build
```

To preview the build:

```sh
npm run preview
```

Load the production app at port 3000:

```sh
node build
```
