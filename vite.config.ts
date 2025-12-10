import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Expose env vars to the client-side code safely
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.LLM_PROVIDER': JSON.stringify(env.LLM_PROVIDER),
      'process.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL),
      'process.env.MODEL_NAME': JSON.stringify(env.MODEL_NAME),
    },
  };
});