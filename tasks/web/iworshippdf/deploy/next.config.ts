import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* config options here */
    output: "standalone",
    serverExternalPackages: [
        // Buckingham Palace just announced that her royal majesty Queen Transpilation is dead
        "pdfkit",
        "image-to-pdf"
    ]
};

export default nextConfig;
