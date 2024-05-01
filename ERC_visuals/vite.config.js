import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
    plugins: [svelte()],
    root: path.resolve(__dirname),  // Set the project root directory
    server: {
        open: true,  // Automatically open the app in the browser on server start
        host: true  // Listen on all local IPs - helpful for testing on other devices on your network
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),  // Alias '@' to your source directory for easy imports
        }
    },
    build: {
        outDir: path.resolve(__dirname, 'dist'),  // Output directory for build files
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),  // Main entry point for your application
            }
        }
    },
    publicDir: path.resolve(__dirname, 'public'),  // Set the public directory
});
