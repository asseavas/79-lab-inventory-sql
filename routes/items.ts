import express from 'express';
import { ApiItem, Item } from '../types';
import { imagesUpload } from '../multer';
import mysqlDb from '../mysqlDb';
import { ResultSetHeader } from 'mysql2';

const itemsRouter = express.Router();

itemsRouter.get('/', async (req, res, next) => {
  try {
    const result = await mysqlDb
      .getConnection()
      .query('SELECT id, title, category_id, place_id FROM items');
    const items = result[0] as Item[];
    return res.send(items);
  } catch (e) {
    next(e);
  }
});

itemsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await mysqlDb
      .getConnection()
      .query('SELECT * FROM items WHERE id = ?', [id]);
    const items = result[0] as Item[];

    if (items.length === 0) {
      return res.status(404).send({ error: 'Item not found' });
    }

    return res.send(items[0]);
  } catch (e) {
    next(e);
  }
});

itemsRouter.post('/', imagesUpload.single('image'), async (req, res, next) => {
  try {
    if (!req.body.title || !req.body.category_id || !req.body.place_id) {
      return res
        .status(400)
        .send({ error: 'Title, category_id and place_id are required!' });
    }
    const categoryId = parseInt(req.body.category_id);
    const placeId = parseInt(req.body.place_id);

    const [categoryResult] = await mysqlDb
      .getConnection()
      .query('SELECT id FROM categories WHERE id = ?', [categoryId]);

    if ((categoryResult as any[]).length === 0) {
      return res
        .status(404)
        .send({ error: 'Category ID not found. Please enter a valid ID.' });
    }

    const [placeResult] = await mysqlDb
      .getConnection()
      .query('SELECT id FROM places WHERE id = ?', [placeId]);

    if ((placeResult as any[]).length === 0) {
      return res
        .status(404)
        .send({ error: 'Place ID not found. Please enter a valid ID.' });
    }

    const item: ApiItem = {
      category_id: parseInt(req.body.category_id),
      place_id: parseInt(req.body.place_id),
      title: req.body.title,
      description: req.body.description || null,
      image: req.file ? req.file.filename : null,
    };
    const insertResult = await mysqlDb
      .getConnection()
      .query(
        'INSERT INTO items (category_id, place_id, title, description, image) VALUES (?, ?, ?, ?, ?)',
        [
          item.category_id,
          item.place_id,
          item.title,
          item.description,
          item.image,
        ],
      );
    const resultHeader = insertResult[0] as ResultSetHeader;
    const getNewResult = await mysqlDb
      .getConnection()
      .query('SELECT * FROM items WHERE id = ?', [resultHeader.insertId]);
    const items = getNewResult[0] as Item[];
    return res.send(items[0]);
  } catch (e) {
    next(e);
  }
});

itemsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleteResult = await mysqlDb
      .getConnection()
      .query('DELETE FROM items WHERE id = ?', [id]);
    const resultHeader = deleteResult[0] as ResultSetHeader;

    if (resultHeader.affectedRows > 0) {
      return res.status(200).send({ message: 'Item deleted successfully.' });
    } else {
      return res.status(404).send({ error: 'Item not found.' });
    }
  } catch (error) {
    next(error);
  }
});

export default itemsRouter;
