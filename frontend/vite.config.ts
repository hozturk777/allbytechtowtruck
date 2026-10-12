import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { headTags } from './src/lib/seo.ts'

// <title>, meta etiketleri ve JSON-LD, src/data/site.ts'ten üretilip <head>'e basılır.
function seoHead(): Plugin {
  return {
    name: 'seo-head',
    transformIndexHtml: (html) => html.replace('<!--app-head-->', headTags()),
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seoHead()],
})
