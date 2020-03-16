import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likeView from './views/likeView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 *  - Search object
 *  - Current recipe object
 *  - Shopping list
 *  - Liked recipes
 */
const state = {};

//  Search controller
const controlSearch = async () => {
    // 1. Get query string
    const query = searchView.getInput();

    if (query) {
        // 2. New search object and add to state
        state.search = new Search(query);
        
        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        recipeView.clearRecipe();
        renderLoader(elements.searchRes)        

        try {
            // 4. Search for recepis
            await state.search.getResults();
        
            // 5. Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert ('Something went wrong! :(');
        }
            
    }
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);        
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

//  Recipe controller

const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');

    if (id) {
        // 1. Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        // 2. Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // 3. Get recipe data
            await state.recipe.getRecipe();
        
            // 4. Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            state.recipe.parseIngredients();
        
            // 5. Render recipe       
            clearLoader();
            recipeView.rednerRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (error) {
            alert('Something went wrong! :(');
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 *  LIST CONTROLLER
 */
const controlList = () => {
    if (!state.list) state.list = new List();

    // Add ingredients to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};

elements.shopping.addEventListener('click', e=> {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id);
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


/**
 *  LIKE CONTROLLER
 */
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked the current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likeView.toggleLikeBtn(true);

        // Add like to the UI list
        likeView.renderLike(newLike);

    // User HAS liked the current recpie
    } else {
        // Remove like from state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likeView.toggleLikeBtn(false);

        // Remove like from UI list
        likeView.deleteLike(currentID);

    }
    likeView.toggleLikeMenu(state.likes.getNumberOfLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likeView.toggleLikeMenu(state.likes.getNumberOfLikes());

    // Render existing likes
    state.likes.likes.forEach(like => likeView.renderLike(like));
});

elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {

        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');        
            recipeView.updateServingsAndIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsAndIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }
});