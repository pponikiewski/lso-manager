import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LSO Manager",
    short_name: "LSO Manager",
    description: "System zarządzania Służbą Liturgiczną",
    start_url: "/",
    display: "standalone", // To ukrywa pasek przeglądarki
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}