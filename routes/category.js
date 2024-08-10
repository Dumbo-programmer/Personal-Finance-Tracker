const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

// Show all categories
router.get('/', ensureAuthenticated, categoryController.getAllCategories);

// Show form to add a new category
router.get('/new', ensureAuthenticated, categoryController.getNewCategoryForm);

// Handle form submission for creating a new category
router.post('/new', ensureAuthenticated, categoryController.createCategory);

// Show form to edit a category
router.get('/:id/edit', ensureAuthenticated, categoryController.getEditCategoryForm);

// Handle form submission for updating a category
router.post('/:id/edit', ensureAuthenticated, categoryController.updateCategory);

// Handle category deletion
router.post('/:id/delete', ensureAuthenticated, categoryController.deleteCategory);

module.exports = router;
