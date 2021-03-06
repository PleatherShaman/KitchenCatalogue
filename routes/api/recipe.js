const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const { check, validationResult } = require("express-validator/check");
const Recipe = require("../../models/Recipe");
const User = require("../../models/User");

// *** Create a new recipe *** working
router.post(
  "/",
  [
    authMiddleware,
    [
      check("title", "A title is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      imageUrl,
      url,
      servings,
      time,
      keywords,
      ingredients,
      instructions
    } = req.body;

    const recipeFields = {};
    recipeFields.user = req.user.id;
    if (title) recipeFields.title = title;
    if (imageUrl) recipeFields.imageUrl = imageUrl;
    if (url) recipeFields.url = url;
    if (servings) recipeFields.servings = servings;
    if (time) recipeFields.time = time;
    if (keywords) recipeFields.keywords = keywords;
    if (ingredients) recipeFields.ingredients = ingredients;
    if (instructions) recipeFields.instructions = instructions;

    try {
      recipe = new Recipe(recipeFields);
      await recipe.save();

      res.json(recipe);
    } catch (err) {
      
      res.status(500).json({
        errors: [
          {
            msg:
              "A recipe with that title has already been registered - please use a different title"
          }
        ]
      });
    }
  }
);

//  *** get all users recipes *** 
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.query.search) {
      const recipes = await Recipe.find({
        user: req.user.id,
        title: { $regex: req.query.search, $options: "i" }
      }).populate('user', ['username']);
      res.json(recipes);
    } else {
      const recipes = await Recipe.find({ user: req.user.id }).populate('user', ['username']);
      res.json(recipes);
    }
  } catch (err) {
    res.status(500).send("Server Error - cannot fetch user recipes");
  }
});


// *** get individual recipe *** 
router.get("/:recipe_id", authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.recipe_id
    }).populate("user", ["id", "username"]);

    if (!recipe) {
      return res.status(400).json({ msg: "recipe not found - from try" });
    }
    if (recipe.user.id !== req.user.id) {
      return res
        .status(400)
        .json({ msg: "You are not authorised to access this recipe" });
    }
    res.json(recipe);
  } catch (err) {
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Recipe not found - from catch" });
    }
    res.status(500).send("Server Error");
  }
});

// *** Edit a recipe ***

router.put(
  "/:recipe_id",
  [
    authMiddleware,
    [
      check("title", "A title is required")
        .not()
        .isEmpty()
    ]
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      imageUrl,
      url,
      servings,
      time,
      keywords,
      ingredients,
      instructions
    } = req.body;

    const recipeFields = {};
    if (title) recipeFields.title = title;
    if (imageUrl) recipeFields.imageUrl = imageUrl;
    if (url) recipeFields.url = url;
    if (servings) recipeFields.servings = servings;
    if (time) recipeFields.time = time;
    if (keywords) recipeFields.keywords = keywords;
    if (ingredients) recipeFields.ingredients = ingredients;
    if (instructions) recipeFields.instructions = instructions;

    try {
      await Recipe.findOneAndUpdate(
        { _id: req.params.recipe_id },
        recipeFields
      );
      res.json({ msg: "recipe updated" });
    } catch (err) {
      if (err.code == 11000) {
        return res.status(500).json([
          {
            msg: "Please Use A Unique Recipe Title",
            errorType: "LoginDanger"
          }
        ]);
      } else {
        return res
          .status(500)
          .send("Server Error - cannot create a new recipe");
      }
    }
  }
);

//  *** Delete Route - unused ** 

router.delete("/:recipe_id", authMiddleware, async (req, res) => {
  try {
    await Recipe.deleteOne({ _id: req.params.recipe_id });
    res.json({ msg: "Recipe  deleted" });
  } catch (err) {
    res.status(500).send("Server Error - cannot delete recipe");
  }
});

// *** Get recipe favourites ***

router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).send("Server Error - User cannot be found");
  }
});

router.get("/favourite", authMiddleware, async (req, res) => {
  try {
    const favRecipes = await User.findbyId(req.user.id)
      .select("-password")
      .populate("favouriteRecipes");

    res.json(favRecipes.favouriteRecipes);

    
  } catch (err) {
    res.status(500).send("Server Error - cannot add to favourite");
  }
});

// *** add recipe to favourite ****

router.put(
  "/favourite",
  [authMiddleware],

  async (req, res) => {
    const { recipeId } = req.body;

    try {
      let newFavRecipe = await User.findOne({ favouriteRecipes: recipeId });

      if (newFavRecipe) {
        return res.status(400).json({
          errors: [
            {
              msg:
                "This has already been favourited - please use a different email"
            }
          ]
        });
      }

      let favouritedRecipes = await User.findOneAndUpdate(
        { _id: req.user.id },
        { $push: { favouriteRecipes: recipeId } }
      ).populate("favouriteRecipes", ["title"]);

      res.json(favouritedRecipes.favouriteRecipes);
    } catch (err) {
      res.status(500).send("Server Error - cannot add to favourite");
    }
  }
);

module.exports = router;
