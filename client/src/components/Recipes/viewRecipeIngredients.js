import React , {Fragment}from "react";
import PropTypes from "prop-types";

function ViewRecipeIngredients(props) {
    const {ingredients} = props

    return (
    <>
      <section className="ingredients ">
        <ul className="">
          <li className=" ">
            <h3>Ingredients</h3>{" "}
          </li>
          {ingredients.map((ingredient, index) => (
            <Fragment key={ingredient + index}>
              {/* <li> {`${ingredient.quantity} ${ingredient.unit} of ${ingredient.ingredientName}`}</li> */}
              <li>{ingredient}</li>
            </Fragment>
          ))}
        </ul>
      </section>
    </>
  );
}


export default ViewRecipeIngredients;
