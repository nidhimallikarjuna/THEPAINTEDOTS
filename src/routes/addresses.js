import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../utils.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const addressSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(25),
  address_line: z.string().trim().min(5).max(255),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z.string().trim().min(4).max(12),
  is_default: z.boolean().optional()
});

// GET all saved addresses for the logged-in user
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const [addresses] = await pool.execute(
    `SELECT 
      id,
      user_id,
      full_name,
      phone,
      address_line,
      city,
      state,
      pincode,
      is_default,
      created_at
    FROM addresses
    WHERE user_id = ?
    ORDER BY is_default DESC, created_at DESC`,
    [req.user.id]
  );

  res.json({ addresses });
}));

// POST - Add a new address
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const parsed = addressSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Please provide valid address details.'
    });
  }

  const {
    full_name,
    phone,
    address_line,
    city,
    state,
    pincode,
    is_default
  } = parsed.data;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.execute(
      'SELECT id FROM addresses WHERE user_id = ? FOR UPDATE',
      [req.user.id]
    );

    const makeDefault = Boolean(is_default) || existing.length === 0;

    if (makeDefault) {
      await connection.execute(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
        [req.user.id]
      );
    }

    const [result] = await connection.execute(
      `INSERT INTO addresses
      (user_id, full_name, phone, address_line, city, state, pincode, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        full_name,
        phone,
        address_line,
        city,
        state,
        pincode,
        makeDefault
      ]
    );

    const [rows] = await connection.execute(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [result.insertId, req.user.id]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Address added successfully.',
      address: rows[0]
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

// PUT - Update an existing address
router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const parsed = addressSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Please provide valid address details.'
    });
  }

  const {
    full_name,
    phone,
    address_line,
    city,
    state,
    pincode,
    is_default
  } = parsed.data;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.execute(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ? FOR UPDATE',
      [req.params.id, req.user.id]
    );

    if (!existing.length) {
      await connection.rollback();

      return res.status(404).json({
        error: 'Address not found.'
      });
    }

    if (is_default === true) {
      await connection.execute(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
        [req.user.id]
      );
    }

    await connection.execute(
      `UPDATE addresses
       SET full_name = ?, phone = ?, address_line = ?,
           city = ?, state = ?, pincode = ?,
           is_default = COALESCE(?, is_default)
       WHERE id = ? AND user_id = ?`,
      [
        full_name,
        phone,
        address_line,
        city,
        state,
        pincode,
        is_default ?? null,
        req.params.id,
        req.user.id
      ]
    );

    const [rows] = await connection.execute(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    await connection.commit();

    res.json({
      message: 'Address updated successfully.',
      address: rows[0]
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));


// DELETE - Remove an address and maintain a default address
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Lock this user's addresses while deleting
    const [addresses] = await connection.execute(
      `SELECT id, is_default
       FROM addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, created_at DESC
       FOR UPDATE`,
      [req.user.id]
    );

    const addressToDelete = addresses.find(
      address => address.id === Number(req.params.id)
    );

    if (!addressToDelete) {
      await connection.rollback();

      return res.status(404).json({
        error: 'Address not found.'
      });
    }

    await connection.execute(
      'DELETE FROM addresses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    const remainingAddresses = addresses.filter(
      address => address.id !== Number(req.params.id)
    );

    // Promote another address if the deleted one was default
    // or no default address currently exists
    const hasDefault = remainingAddresses.some(
      address => Boolean(address.is_default)
    );

    if (
      remainingAddresses.length > 0 &&
      (Boolean(addressToDelete.is_default) || !hasDefault)
    ) {
      await connection.execute(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
        [req.user.id]
      );

      await connection.execute(
        'UPDATE addresses SET is_default = TRUE WHERE id = ? AND user_id = ?',
        [remainingAddresses[0].id, req.user.id]
      );
    }

    await connection.commit();

    res.json({
      message: 'Address deleted successfully.'
    });

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));


// PATCH - Set an address as default
router.patch('/:id/default', requireAuth, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.execute(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ? FOR UPDATE',
      [req.params.id, req.user.id]
    );

    if (!existing.length) {
      await connection.rollback();

      return res.status(404).json({
        error: 'Address not found.'
      });
    }

    await connection.execute(
      'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
      [req.user.id]
    );

    await connection.execute(
      'UPDATE addresses SET is_default = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    await connection.commit();

    res.json({
      message: 'Default address updated successfully.'
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

export default router;