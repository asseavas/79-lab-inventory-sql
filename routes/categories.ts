import express from 'express';
import mysqlDb from '../mysqlDb';
import { ApiCategory, Category } from '../types';
import { ResultSetHeader } from 'mysql2';

const categoriesRouter = express.Router();

categoriesRouter.get('/', async (req, res, next) => {
  try {
    const result = await mysqlDb
      .getConnection()
      .query('SELECT id, title FROM categories');

    const categories = result[0] as Category[];
    return res.send(categories);
  } catch (e) {
    next(e);
  }
});

categoriesRouter.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await mysqlDb
      .getConnection()
      .query('SELECT * FROM categories WHERE id = ?', [id]);
    const categories = result[0] as Category[];

    if (categories.length === 0) {
      return res.status(404).send({ error: 'Category not found' });
    }

    return res.send(categories[0]);
  } catch (e) {
    next(e);
  }
});

categoriesRouter.post('/', async (req, res, next) => {
  try {
    if (!req.body.title) {
      return res.status(400).send({ error: 'Title is required!' });
    }

    const category: ApiCategory = {
      title: req.body.title,
      description: req.body.description || null,
    };

    const insertResult = await mysqlDb
      .getConnection()
      .query('INSERT INTO categories (title, description) VALUES (?, ?)', [
        category.title,
        category.description,
      ]);

    const resultHeader = insertResult[0] as ResultSetHeader;

    const getNewResult = await mysqlDb
      .getConnection()
      .query('SELECT * FROM categories WHERE id = ?', [resultHeader.insertId]);

    const categories = getNewResult[0] as Category[];

    return res.send(categories[0]);
  } catch (e) {
    next(e);
  }
});

categoriesRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;

    const [relatedResources] = (await mysqlDb
      .getConnection()
      .query('SELECT COUNT(*) as count FROM items WHERE category_id = ?', [
        id,
      ])) as any[];

    if (relatedResources[0].count > 0) {
      return res.status(400).send({
        error: 'Category has related resources and cannot be deleted.',
      });
    }

    const deleteResult = await mysqlDb
      .getConnection()
      .query('DELETE FROM categories WHERE id = ?', [id]);

    const resultHeader = deleteResult[0] as ResultSetHeader;

    if (resultHeader.affectedRows > 0) {
      return res
        .status(200)
        .send({ message: 'Category deleted successfully.' });
    } else {
      return res.status(404).send({ error: 'Category not found.' });
    }
  } catch (error) {
    next(error);
  }
});

export default categoriesRouter;
