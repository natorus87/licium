/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                blue: {
                    50: '#f4f8fb',
                    100: '#e2eff6',
                    200: '#c6dfea',
                    300: '#9cc5db',
                    400: '#6ba4c6',
                    500: '#4580a5', // Licium Steel Blue
                    600: '#356686',
                    700: '#2d526d',
                    800: '#28455b',
                    900: '#243a4c',
                    950: '#162532',
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
