const Category = require("../models/Category");

const getCategory = async (req, res) => {
    try {
        const category = await Category.find().sort({ createdAt: -1 });
        res.json(category);
    } catch (error) {
        console.error("Une erreur est survenue lors de l'affichage :", error);
        return res.status(500).json({ error: error.message });
    }
}

const addCategory = async (req, res) => {
    try {
        const { category } = req.body;
        
        if(!category?.trim()) return res.status(400).json({ message: "Le nom est requis "});

        const categoryExist = await Category.findOne({ nom: category });
        if(categoryExist) return res.status(400).json({ message: "Cette categorie existe déja" });

        const newCategory = new Category({
            nom: category,
            createBy: req.user?.id
        });
        
        await newCategory.save();

        return res.status(201).json({
            message: "Catégorie crée avec succès",
            category: newCategory
        });
        
    } catch (error) {
        console.error("Erreur :", error);
        return res.status(500).json({ error: error.message });
    }
}

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params
        const { category } = req.body;

        if(!category?.trim()) return res.status(400).json({ message: "Veuillez entrer une categorie" });

        const categoryExist = await Category.findOne({ nom: category.trim() });
        if(categoryExist && categoryExist.id !== id) {
            return res.status(400).json({ message: "Nom de categorie déja utilisé" });
        }

        const newCategory = await Category.findByIdAndUpdate(
            id,
            { nom: category.trim() },
            { new: true, runValidators: true }
        );

        if(!newCategory) return res.status(404).json({ message: "Category introuvable" });
        
        return res.status(200).json({
            message: "Category modifier avec succès",
            category: newCategory
        });

    } catch (error) {
        console.error("Erreur :", error);
        return res.status(500).json({ error: error.message });
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const categoryExist = await Category.findById(id);
        if(!categoryExist) return res.status(404).json({ message: "Categorie introuvable" });

        await categoryExist.deleteOne();
    } catch (error) {
        console.error("Erreur :", error);
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { getCategory, addCategory, updateCategory, deleteCategory };