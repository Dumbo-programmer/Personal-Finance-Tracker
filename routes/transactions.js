const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');
const Category = require('../models/category');

// Route to show all transactions
router.get('/', async (req, res) => {
  const transactions = await Transaction.findAll({
    where: { userId: req.user.id }, // Assuming you have user authentication
    include: [Category]
  });
  res.render('transactions/index', { transactions });
});

// Route to show form for adding a new transaction
router.get('/new', async (req, res) => {
  const categories = await Category.findAll({ where: { userId: req.user.id } });
  res.render('transactions/new', { categories });
});

// Route to handle adding a new transaction
router.post('/new', async (req, res) => {
  const { amount, description, categoryId, date } = req.body;
  try {
    await Transaction.create({
      amount,
      description,
      date,
      categoryId,
      userId: req.user.id
    });
    res.redirect('/transactions');
  } catch (err) {
    res.render('transactions/new', { error: 'Error adding transaction' });
  }
});

// Route to show form for editing a transaction
router.get('/:id/edit', async (req, res) => {
  const transaction = await Transaction.findByPk(req.params.id);
  const categories = await Category.findAll({ where: { userId: req.user.id } });
  res.render('transactions/edit', { transaction, categories });
});

// Route to handle updating a transaction
router.post('/:id/edit', async (req, res) => {
  const { amount, description, categoryId, date } = req.body;
  try {
    await Transaction.update(
      { amount, description, date, categoryId },
      { where: { id: req.params.id, userId: req.user.id } }
    );
    res.redirect('/transactions');
  } catch (err) {
    res.render('transactions/edit', { error: 'Error updating transaction' });
  }
});

// Route to handle deleting a transaction
router.post('/:id/delete', async (req, res) => {
  try {
    await Transaction.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.redirect('/transactions');
  } catch (err) {
    res.redirect('/transactions');
  }
});

module.exports = router;
