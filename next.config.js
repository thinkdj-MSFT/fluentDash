/** @type {import('next').NextConfig} */

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
    basePath: '',
    output: isProduction?'export':'',
}

module.exports = nextConfig
