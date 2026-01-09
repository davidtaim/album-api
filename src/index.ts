import { randomUUIDv7 } from 'bun';
import { Database } from 'bun:sqlite';
import { Elysia, t } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { cors } from '@elysiajs/cors'

interface Photo {
  id: number;
  name: string;
  message: string;
  url_image: string;
}

const db = new Database("photo-api.sqlite");

const createTables = async () => {
  db.query(`
    CREATE TABLE IF NOT EXISTS album (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      message TEXT,
      url_image TEXT
    )
    `).run();
}

createTables().then(() => {
  new Elysia()
    .use(cors())
    .use(staticPlugin())
    .post('/upload', async ({ status, body: { name, message, photo } }) => {
      try {
        const uniquePhotoUUID = randomUUIDv7();
        const extension = photo.name.split('.')[1];
        let photoPath = `public/photos/${uniquePhotoUUID}.${extension}`;

        Bun.write(photoPath, photo);

        const url = `http:localhost:3000/${photoPath}`;
        db.query(`INSERT INTO album (name, message, url_image) 
                  VALUES (?, ?, ?)`)
          .run(name, message, url);
        return status(201, { url });
      } catch (e) {
        return status(500, {
          msg: "error saving the file",
          error: e
        });
      }
    }, {
      body: t.Object({
        name: t.String(),
        message: t.String(),
        photo: t.File({ format: "image/*" })
      })
    })
    .get('/album', async () => {
      return db.query('SELECT id, name, message, url_image FROM album').all();
    })
    .delete('/photo/:id', async ({ params: { id }, set}) => {
      const row = db.query('SELECT id, name, message, url_image FROM album WHERE id = $id');
      const fileData = row.get({
        $id: id
      }) as Photo;

      const path = fileData.url_image.split('3000/')[1];

      db.run('DELETE FROM album WHERE id = ?', [id]);

      await Bun.file(path).delete();

      set.status = 204;
    })
    .listen(Bun.env.PORT || 3000);

  console.log("🚀 Server running at port: 3000");
});