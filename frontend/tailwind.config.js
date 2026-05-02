/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}



/* @type {import('tailwindcss').Config} 
export default {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}

Esto era el tailwind anterior y lo voy a configurar de manera diferente, para que tome los archivos de la carpeta src y no de la raíz del proyecto, ya que ahora el tailwind se encuentra dentro de la carpeta frontend y no en la raíz del proyecto.

*/