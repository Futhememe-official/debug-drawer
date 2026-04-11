# Installation Instructions for @withgus/debug-drawer

## Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (version 12.0 or later)
- npm (comes with Node.js)
- yarn (if you prefer using it over npm)
- pnpm (if you prefer using it over npm)

## Installation
You can install the @withgus/debug-drawer library via the following package managers:

### Using npm
```bash
npm install @withgus/debug-drawer
```

### Using yarn
```bash
yarn add @withgus/debug-drawer
```

### Using pnpm
```bash
pnpm add @withgus/debug-drawer
```

## Setting Up MSW (Mock Service Worker)
To set up MSW in your React application:
1. Install MSW:
   ```bash
   npm install msw
   ```
   or
   ```bash
   yarn add msw
   ```
   or
   ```bash
   pnpm add msw
   ```

2. Create a new file `src/mocks/browser.js` with the following content:
   ```javascript
   import { setupWorker, rest } from 'msw';

   // Define request handlers for the worker
   const worker = setupWorker(
       // Add your request handlers here
   );

   export { worker };
   ```

3. Start the worker in your application entry point (e.g., `index.js`):
   ```javascript
   import { worker } from './mocks/browser';

   // Start the Mock Service Worker
   worker.start();
   ```

## Configuring Your React App
To configure the @withgus/debug-drawer in your React app:
1. Import the DebugDrawer component:
   ```javascript
   import { DebugDrawer } from '@withgus/debug-drawer';
   ```

2. Wrap your application with the `DebugDrawer` provider in your main component:
   ```javascript
   const App = () => (
       <DebugDrawer>
           {/* Your application components */}
       </DebugDrawer>
   );
   ```

## Usage Examples
- To trigger the debug drawer, you can use a button:
   ```javascript
   const openDrawer = () => {
       // Logic to open the debug drawer
   };
   ```

## Troubleshooting
### Common Issues
- **Installation issues**: If you face issues during installation, ensure that your Node.js version is compatible and try clearing the npm cache:
   ```bash
   npm cache clean --force
   ```

- **MSW not working**: Make sure you have initialized the MSW correctly and that the service worker has been registered in the application.

- **Debug drawer not appearing**: Check your component hierarchy to ensure that the `DebugDrawer` is included and that there are no CSS conflicts.

For further assistance, please refer to the official documentation or the community forums.