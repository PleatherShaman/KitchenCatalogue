import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import ContentContainer from "../../Layout/contentContainer/contentContainer";
import Spinner from "../../Layout/spinner";
import AddToCookbookSelect from "./addToCookbookSelect";
import ViewRecipeDetails from "./viewRecipeDetails";
import ViewRecipeIngredients from "./viewRecipeIngredients";
import ViewRecipeInstructions from "./viewRecipeInstructions";
import ConfirmModal from "../../Layout/confirmModal";
import {
  getRecipeById,
  deleteRecipe,
  updateRecipe_LS
} from "../../../actions/individualRecipe";
import { addRecipeToCookbook } from "../../../actions/cookbook";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import "./individualRecipe.css";

const IndividualRecipe = props => {
  const {
    match,
    getRecipeById,
    deleteRecipe,
    history,
    individualRecipe,
    updateRecipe_LS,
    addRecipeToCookbook
  } = props;

  const { loading } = individualRecipe;
  const [isDelete, setIsDelete] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [addedCookbooks, setAddedCookbooks] = useState([]);
  const deleteModalRef = useRef();
  const addTofavRef = useRef();
  const topPage = useRef();

  let {
    title,
    imageUrl,
    servings,
    time,
    ingredients,
    instructions,
    user,
    _id
  } = individualRecipe.recipe;

  useEffect(() => {
    var localRecipes = JSON.parse(localStorage.getItem("recipeState"));

    if (!localRecipes) {
      getRecipeById(match.params.recipe_id, history);
    }

    if (localRecipes) {
      let foundRecipe = localRecipes.find(
        recipe => recipe._id === match.params.recipe_id
      );

      if (!foundRecipe) {
        history.push("/recipe");
      } else {
        updateRecipe_LS(foundRecipe);
      }
    }
  }, []);



  useEffect(() => {
    const handleClickOutsideSettings = e => {
      e.stopPropagation();

      if (deleteModalRef.current.contains(e.target)) {
        return;
      } else {
        setIsDelete(false);
      }
    };

    if (isDelete) {
      document.addEventListener("mousedown", handleClickOutsideSettings);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideSettings);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSettings);
    };
  }, [isDelete]);

  useEffect(() => {
    const handleClickOutsideSettings = e => {
      e.stopPropagation();

      if (addTofavRef.current.contains(e.target)) {
        return;
      } else {
        setIsFavourite(false);
      }
    };

    if (isFavourite) {
      document.addEventListener("mousedown", handleClickOutsideSettings);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideSettings);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSettings);
    };
  }, [isFavourite]);

  const handleDelete = () => {
    setIsDelete(true);
  };

  const handleAddToCookbook = () => {
    if (addedCookbooks.length < 1) {
      setIsFavourite(false);
      return;
    }
    // this picks out the selected cookbooks
    let selectedCookbook = addedCookbooks.value;
    // check if recipe is already in cookbook
    // find id not equal to recipe
    let IsRecipeAlreadyInside = selectedCookbook.savedRecipes.find(
      o => o._id === _id
    );

    if (IsRecipeAlreadyInside === undefined) {
      let data = { cookbookId: selectedCookbook._id, recipeId: _id };
      addRecipeToCookbook(data);
      setIsFavourite(false);
    } else {
      setIsFavourite(false);
    }
  };
  const handleDeleteConfirmation = () => {
    deleteRecipe(history, match.params.recipe_id);
  };

  const handleCookbookClick = () => {
    setIsFavourite(true);
  };

  return (
    <ContentContainer {...props}>
      {loading || title === undefined ? (
        <Spinner />
      ) : (
        <main className="content" ref={topPage}>
          <div className="contentContainer">
            <div className="contentBox ">
              <ConfirmModal
                confirmAction={handleDeleteConfirmation}
                closeAction={() => setIsDelete(false)}
                id="confirmDeleteRecipe"
                ref={deleteModalRef}
                title={`Delete Recipe`}
                text={`Are you sure you want to delete this recipe?`}
                confirmationText="Delete"
                isShowing={isDelete}
              />

              <div className="contentBoxContent ">
                <ConfirmModal
                  confirmAction={handleAddToCookbook}
                  closeAction={() => setIsFavourite(false)}
                  id="confirmDeleteRecipe"
                  ref={addTofavRef}
                  title={`Add Recipe To Cookbook`}
                  text={`Which cookbook would you like to add this recipe to?`}
                  confirmationText="Add"
                  isShowing={isFavourite}
                >
                  <AddToCookbookSelect setAddedCookbooks={setAddedCookbooks} />
                </ConfirmModal>

                <main className="individualRecipe" id="individualRecipe">
                  <h1 className="">{title}</h1>
                  <ViewRecipeDetails
                    user={user}
                    servings={servings}
                    time={time}
                  />

                  <div className="saveButton">
                    <Link to={`/recipe/${_id}/edit`}>
                      <button className="blueButton">Edit</button>
                    </Link>
                    <button className="blueButton" onClick={handleDelete}>
                      Delete
                    </button>
                    <button
                      className="blueButton"
                      onClick={handleCookbookClick}
                    >
                      Add to cookbook
                    </button>
                  </div>

                  <section className="imageContainer ">
                    {!imageUrl ? (
                      <div className="fillerImg" />
                    ) : (
                      <img className="image" src={imageUrl} alt={title} />
                    )}
                  </section>
                  <hr className="width80" />

                  <div className="recipeText">
                    <ViewRecipeIngredients ingredients={ingredients} />
                    <ViewRecipeInstructions instructions={instructions} />
                  </div>
                </main>
              </div>
            </div>
          </div>
        </main>
      )}
    </ContentContainer>
  );
};

IndividualRecipe.propTypes = {
  getRecipeById: PropTypes.func.isRequired,
  deleteRecipe: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  individualRecipe: state.individualRecipe
});

export default connect(
  mapStateToProps,
  {
    getRecipeById,
    deleteRecipe,
    updateRecipe_LS,
    addRecipeToCookbook
  }
)(IndividualRecipe);
