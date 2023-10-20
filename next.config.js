/** @type {import('next').NextConfig} */

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
    basePath: '',
    output: isProduction?'export':'standalone', // static export for github pages
}

module.exports = nextConfig
