import { defineConfig } from 'vite';

// GitHub Pages serves project sites below /<repository>/ while local Vite
// development should continue to use /. The workflow exposes the repository
// name through GITHUB_REPOSITORY, so forks and renamed repositories work too.
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'RacingGame';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? `/${repository}/` : '/',
});
