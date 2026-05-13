# Evan Klem Portfolio

Personal portfolio site for Evan Ramirez-Klem. The site is a Vite, React, and TypeScript app with a WebGL vase scene, animated section navigation, project details, art archive, and resume link. The 3D models are museum scans of real historical artifacts.

## Stack

- React 19
- TypeScript
- Vite
- Three.js with React Three Fiber
- Vitest and Testing Library
- Vercel Web Analytics

## Development

Install dependencies:

```sh
npm install
```

Start the local dev server:

```sh
npm run dev
```

Run checks before shipping:

```sh
npm run lint
npm run test:run
npm run build
```

## Deployment

The project is built for Vercel. Web Analytics is enabled through `@vercel/analytics/react` in `src/main.tsx`; after deployment, visit the live site and navigate between sections to start collecting page views in Vercel Analytics.

## Project Structure

- `src/scene/` - WebGL scene, navigation, panel components, and section data
- `src/styles/` - shared styles split by panel domain
- `src/__tests__/` and `src/scene/__tests__/` - smoke, data, and scene behavior tests
- `public/` - static images, models, cursors, video, audio, and resume assets
- `scripts/` - local visual inspection and asset-generation helpers

## License

This is a personal portfolio. Source code and assets are not licensed for reuse unless permission is granted.
