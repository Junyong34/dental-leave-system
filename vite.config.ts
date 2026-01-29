import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  console.log('⭐️ com =>', command, mode)
  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: './src/vitest.setup.ts',
      css: true,
    },
  }
})
