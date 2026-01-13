export const env = {
    PORT: Number(process.env.PORT || 3000),
    DATABASE_URL: process.env.DATABASE_URL ?? 'photo.sqlite',
    DOMAIN: process.env.DOMAIN ?? 'http://localhost',
    PHOTOS_PATH: process.env.PHOTOS_PATH ?? 'public/photos'
};
