// Get meals element div (random meals section)
const mealsEl = document.getElementById("meals");
const favMealsEl = document.getElementById("fav-meals");

getRandomMeal(); //call fetch function
fetchMealById(); // call fetch func based on ID

// make fetch to get random meal
async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const respData = await resp.json();
  const randomMeal = respData.meals[0];
  // call addMeal to load random meal to the page
  addMeal(randomMeal, true);
}

// fetch meal based on id
async function getMealById(id) {
  const resp = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );
  const respData = await resp.json();
  const meal = respData.meals[0];
  return meal;
}

// get meal by name, return all meals contain term
async function getMealByName(term) {
  const resp = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`
  );
  const respData = await resp.json();
  const meals = respData.meals;
  return meals;
}

// add meal function it takes randomMeal and load it in mealsEl
function addMeal(randomMeal, isMeal = false) {
  const meal = document.createElement("div");
  meal.classList.add("meal");
  meal.innerHTML = `
                        <div class="meal-header">
                            ${
                              isMeal
                                ? `<span class="random">
                                Random Recipe
                            </span>`
                                : ""
                            }
                            <img src="${randomMeal.strMealThumb}" alt="${
    randomMeal.strMeal
  }">
                        </div>
                        <div class="meal-body">
                            <h4>${randomMeal.strMeal}</h4>
                            <button class="fav-btn"><i class="fas fa-heart"></i></button>
                        </div>
                    `;
  // get btn then add eventlistner when clicked
  meal
    .querySelector(".meal-body .fav-btn")
    .addEventListener("click", addToFavMeal.bind(randomMeal));

  meal.addEventListener("click", () => {
    showMealInf(randomMeal);
  });

  mealsEl.appendChild(meal);
}

// show purple heart when button clicked
function addToFavMeal() {
  const btn = document.querySelector(".meal button");
  if (btn.classList.contains("active")) {
    btn.classList.remove("active");
    removeMealFromLocalStorage(this.idMeal);
  } else {
    btn.classList.add("active");
    addMealToLocalStorage(this.idMeal);
  }
  // call fun to add all fav meals to fav section
  fetchMealById();
}

// add Meal to localStorage
function addMealToLocalStorage(mealId) {
  const mealsId = getMealsFromLocalStorage();
  localStorage.setItem("mealsId", JSON.stringify([...mealsId, mealId]));
}

// remove Meal from localStorage
function removeMealFromLocalStorage(mealId) {
  const mealsId = getMealsFromLocalStorage();
  localStorage.setItem(
    "mealsId",
    JSON.stringify(mealsId.filter((id) => id !== mealId))
  );
}

// get all meals that exist in localStorage
function getMealsFromLocalStorage() {
  const mealsId = JSON.parse(localStorage.getItem("mealsId"));
  return mealsId === null ? [] : mealsId;
}

// get meal by i, it gets all meal's ids and get meail details
function fetchMealById() {
  // free fav meal container
  favMealsEl.innerHTML = "";
  const mealsIds = getMealsFromLocalStorage();
  mealsIds.forEach(async (mealId) => {
    const meal = await getMealById(mealId);
    appendToFavMeal(meal); // call func to add meal to fav meal section
  });
}

// append liked button meal to the fav meals section
function appendToFavMeal(meal) {
  const favMealEl = document.createElement("li");
  favMealEl.innerHTML = `
        <button class="clear"><i class="fas fa-window-close"></i></button>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <span>${meal.strMeal}</span>
    `;
  const favBtn = document.querySelector(".meal button");
  const clearBtn = favMealEl.querySelector(".clear");
  clearBtn.addEventListener("click", () => {
    favBtn.classList.remove("active"); //make fav-btn not active
    removeMealFromLocalStorage(meal.idMeal);
    fetchMealById();
  });

  favMealEl.addEventListener("click", () => {
    showMealInf(meal);
  });

  favMealsEl.appendChild(favMealEl);
}

// make search
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

searchBtn.addEventListener("click", async () => {
  // clean search container
  mealsEl.innerHTML = "";
  const search = searchTerm.value;
  meals = await getMealByName(search);
  if (meals) {
    meals.forEach((meal) => {
      addMeal(meal);
    });
  }
});

// meal info screen

const mealInfoContainerEl = document.getElementById("meal-info-container");
const closeBtnEL = document.getElementById("close-btn");
const mealDetailEl = document.getElementById("meal-detail");

closeBtnEL.addEventListener("click", () => {
  mealInfoContainerEl.classList.add("hidden");
});

// function to show detail of meal when clicked
function showMealInf(mealData) {
  // clean container
  mealDetailEl.innerHTML = "";
  const mealEl = document.createElement("div");

  // get ingredients and measures
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strIngredient" + i]}`
      );
    } else {
      break;
    }
  }
  // update meal info
  mealEl.innerHTML = `
          <h1>${mealData.strMeal}</h1>
          <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
          />
          <p>${mealData.strInstructions}</p>
          <h3>Ingredients: </h3>
          <ul>
          ${ingredients
            .map(
              (ing) => `
          <li>${ing}</li>
          `
            )
            .join("")}
          </ul>
    `;
  mealDetailEl.appendChild(mealEl);
  //   console.log(mealDetailEl);
  // show meal container
  mealInfoContainerEl.classList.remove("hidden");
}
