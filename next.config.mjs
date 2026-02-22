/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "*.s3.amazonaws.com",
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "25mb",
        },
    },
};

export default nextConfig;
