# vite-plugin-third-party-licenses

A Vite build plugin that emits a plain-text license report as a build asset.

```ts
import { bundledLicenseListPlugin } from "vite-plugin-third-party-licenses";

export default {
  plugins: [bundledLicenseListPlugin()],
};
```

`bundledLicenseListPlugin({ fileName })` accepts an output path relative to the build's `outDir`; it defaults to `licenses.txt` and supports nested paths such as `legal/licenses.txt`. Each Vite build emits a report containing only that build's bundled dependencies. For separate client and SSR builds, each output receives its own report; dependencies externalized by the server build are not included. The plugin enables Vite's native license report internally, converts its JSON metadata to text, and removes only that internal JSON asset.
