import type { Config } from "tailwindcss";

const config: Config = {
   content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
   theme: {
      colors: {
         board: "#F5E2A9",
         "board-border": "#D2BE88",
      },
      extend: {
         keyframes: {
            fadeIn: {
               "0%": { opacity: "0", transform: "scale(0.95)" },
               "100%": { opacity: "1", transform: "scale(1)" },
            },
         },
         animation: {
            "fade-in": "fadeIn 0.2s ease-out",
         },
      },
   },
   plugins: [],
};

export default config;
