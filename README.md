#### Local deployment

Create a `.env` file and configure it as in the `.env.example` file.

Run server:

> [!NOTE]
> Because of the issues with Google Maps loader the screen with the map doesn't always work correctly in strict mode,
> so it's better to run the server in development mode.

```bash
npm install -g serve
```

```bash
npm run build && serve -s build
```