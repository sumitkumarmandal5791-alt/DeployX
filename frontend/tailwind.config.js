/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'selector',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    green: '#C5FF41',
                    dark: '#0B0B0B',
                    surface: '#121212',
                    border: 'rgba(255, 255, 255, 0.1)',
                }
            },
            borderRadius: {
                '3xl': '24px',
                '4xl': '32px',
            }
        },
    },
    plugins: [],
}
