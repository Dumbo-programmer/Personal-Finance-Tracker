const { Category } = require('../models');

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.render('categories/index', { categories });
    } catch (error) {
        res.status(500).send('Server error');
    }
};

// Show the form to create a new category
exports.getNewCategoryForm = (req, res) => {
    res.render('categories/new');
};

// Handle creating a new category
exports.createCategory = async (req, res) => {
    const { name } = req.body;
    try {
        await Category.create({ name });
        res.redirect('/categories');
    } catch (error) {
        res.render('categories/new', { error: 'Failed to create category' });
    }
};

// Show the form to edit a category
exports.getEditCategoryForm = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        res.render('categories/edit', { category });
    } catch (error) {
        res.status(404).send('Category not found');
    }
};

// Handle updating a category
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        category.name = req.body.name;
        await category.save();
        res.redirect('/categories');
    } catch (error) {
        res.render('categories/edit', { error: 'Failed to update category', category });
    }
};

// Handle deleting a category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        await category.destroy();
        res.redirect('/categories');
    } catch (error) {
        res.status(500).send('Failed to delete category');
    }
};
