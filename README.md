# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

The site is hosted on **Vercel** and deploys automatically: every push to the
production branch (`dev`) triggers a production build, and other branches get
preview deployments. No manual deploy command is needed.

The base path is controlled by `baseUrl` in `docusaurus.config.js` (defaults to
`/`, overridable via the `DOCUSAURUS_BASE_URL` env var). Content must resolve
asset URLs through Docusaurus (e.g. the `<DownloadButton>` component) rather than
hardcoding the base path.
