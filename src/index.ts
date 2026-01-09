import { randomUUIDv7 } from 'bun';
import { Database } from 'bun:sqlite';
import { Elysia, t } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { cors } from '@elysiajs/cors'

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
      return db.query("SELECT id, name, message, url_image FROM album").all();
    })
    .listen(Bun.env.PORT || 3000);

  console.log("🚀 Server running at port: 3000");
});