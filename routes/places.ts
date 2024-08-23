import express from 'express';
import mysqlDb from '../mysqlDb';
import { ApiPlace, Place } from '../types';
import { ResultSetHeader } from 'mysql2';

const placesRouter = express.Router();

placesRouter.get('/', async (req, res, next) => {
  try {
    const result = await mysqlDb
      .getConnection()
      .query('SELECT id, title FROM places');
    const places = result[0] as Place[];
    return res.send(places);
  } catch (e) {
    next(e);
  }
});

placesRouter.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await mysqlDb
      .getConnection()
      .query('SELECT * FROM places WHERE id = ?', [id]);
    const places = result[0] as Place[];

    if (places.length === 0) {
      return res.status(404).send({ error: 'Place not found' });
    }

    return res.send(places[0]);
  } catch (e) {
    next(e);
  }
});

placesRouter.post('/', async (req, res, next) => {
  try {
    if (!req.body.title) {
      return res.status(400).send({ error: 'Title is required!' });
    }

    const place: ApiPlace = {
      title: req.body.title,
      description: req.body.description || null,
    };
    const insertResult = await mysqlDb
      .getConnection()
      .query('INSERT INTO places (title, description) VALUES (?, ?)', [
        place.title,
        place.description,
      ]);
    const resultHeader = insertResult[0] as ResultSetHeader;
    const getNewResult = await mysqlDb
      .getConnection()
      .query('SELECT * FROM places WHERE id = ?', [resultHeader.insertId]);
    const places = getNewResult[0] as Place[];
    return res.send(places[0]);
  } catch (e) {
    next(e);
  }
});

placesRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const [relatedResources] = (await mysqlDb
      .getConnection()
      .query('SELECT COUNT(*) as count FROM items WHERE place_id = ?', [
        id,
      ])) as any[];

    if (relatedResources[0].count > 0) {
      return res.status(400).send({
        error: 'PLace has related resources and cannot be deleted.',
      });
    }

    const deleteResult = await mysqlDb
      .getConnection()
      .query('DELETE FROM places WHERE id = ?', [id]);
    const resultHeader = deleteResult[0] as ResultSetHeader;

    if (resultHeader.affectedRows > 0) {
      return res.status(200).send({ message: 'Place deleted successfully.' });
    } else {
      return res.status(404).send({ error: 'Place not found.' });
    }
  } catch (error) {
    next(error);
  }
});

placesRouter.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { title, description } = req.body;

    if (!title && !description) {
      return res.status(400).send({ error: 'No data provided to update.' });
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (title) {
      fields.push('title = ?');
      values.push(title);
    }

    if (description) {
      fields.push('description = ?');
      values.push(description);
    }

    values.push(id);

    const updateResult = await mysqlDb
      .getConnection()
      .query(`UPDATE places SET ${fields.join(', ')} WHERE id = ?`, values);
    const resultHeader = updateResult[0] as ResultSetHeader;

    if (resultHeader.affectedRows === 0) {
      return res.status(404).send({ error: 'Place not found.' });
    }

    const [getNewResult] = await mysqlDb
      .getConnection()
      .query('SELECT * FROM places WHERE id = ?', [id]);
    const places = getNewResult as Place[];
    return res.send(places[0]);
  } catch (e) {
    next(e);
  }
});

export default placesRouter;
