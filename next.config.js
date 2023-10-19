/** @type {import('next').NextConfig} */

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
    basePath: '',
    output: 'export',
}

module.exports = nextConfig
