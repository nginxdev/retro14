
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process';

const getVersion = () => {
    try {
        return execSync('git describe --tags --always').toString().trim();
    } catch (e) {
        return 'dev';
    }
};

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(getVersion()),
  },
  plugins: [react()],
})
