import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
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
            recipeView.rednerRecipe(state.recipe);
        } catch (error) {
            alert('Something went wrong! :(');
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {

        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');        
            recipeView.updateServingsAndIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsAndIngredients(state.recipe);
    }
    console.log(state.recipe)
});


