import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// La API no siempre está en 3001: la auditoría visual y las pruebas levantan su
// propia instancia en otro puerto. Con el destino fijo, `vite preview` proxaba
// hacia un servidor viejo que seguía vivo y la auditoría llegaba a medir el
// código de la sesión anterior en lugar del actual.
const api = process.env.ATLAS_API || 'http://localhost:3001'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: api,
        changeOrigin: true,
      },
    },
  },
  // `preview` hereda el proxy de `server`, pero se declara igual para que quede
  // explícito: es justo el modo que usa `npm run auditar`.
  preview: {
    proxy: {
      '/api': {
        target: api,
        changeOrigin: true,
      },
    },
  },
})
