import { Elysia, t, status } from 'elysia';
import { randomUUIDv7 } from 'bun';
import { db } from '../../db/client';
import { env } from '../../config/env';
import { Photo } from '../../types/types';

const uploadPhotoBody = t.Object({
    name: t.Optional(t.String({ default: '' })),
    message: t.Optional(t.String({ default: '' })),
    photo: t.File({ format: 'image/*' })
});

export const photosModule = new Elysia()
    .post('/upload', async ({ body: { name, message, photo } }) => {
        try {
            const uniquePhotoUUID = randomUUIDv7();
            const extension = photo.name.split('.')[1];
            let photoPath = `${env.PHOTOS_PATH}/${uniquePhotoUUID}.${extension}`;

            Bun.write(photoPath, photo);

            const url = `${env.DOMAIN}/${photoPath}`;
            db.query(`INSERT INTO album (name, message, url_image) 
                      VALUES (?, ?, ?)`)
                .run(name ?? '', message ?? '', url);
            return status(201, { url });
        } catch (e) {
            return status(500, {
                msg: 'error saving the file',
                error: e
            });
        }
    }, {
        body: uploadPhotoBody
    }).get('/album', async () => {
        return db.query('SELECT id, name, message, url_image FROM album').all();
    })
    .get('/query-album', async ({ query }) => {
        const { limit, order } = query;

        return db.query(`SELECT id, name, message, url_image FROM album ORDER BY id ${order} LIMIT ${limit}`).all();

    })
    .get('/pagination-album', async ({ query }) => {

        const { current_page, limit, order } = query;

        let offset = (Number(current_page) - 1) * Number(limit);

        const sql = `SELECT id, name, message, url_image FROM album ORDER BY id ${order} LIMIT ${offset}, ${limit}`;
        const data = db.query(sql).all();

        const url = `${env.DOMAIN}/pagination-album?limit=${limit}&order=${order}&current_page=`;

        const { count } = db.query('SELECT COUNT(*) as count FROM album').get() as { count: number };

        const totalPages = Math.ceil(count / Number(limit));

        return {
            previous_page: current_page == '1' ? '' : `${url}${Number(current_page) - 1}`,
            next_page: Number(current_page) < totalPages ? `${url}${Number(current_page) + 1}` : '',
            total_pages: totalPages,
            data
        };
    })
    .delete('/photo/:id', async ({ params: { id }, set }) => {
        const row = db.query('SELECT id, name, message, url_image FROM album WHERE id = $id');
        const fileData = row.get({
            $id: id
        }) as Photo;

        const path = fileData.url_image.split('3000/')[1];

        db.run('DELETE FROM album WHERE id = ?', [id]);

        await Bun.file(path).delete();

        set.status = 204;
    });
