import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                tjenester: 'tjenester.html',
                showcase: 'showcase.html',
                omOss: 'om-oss.html',
                kontakt: 'kontakt.html',
            },
        },
    },
});
