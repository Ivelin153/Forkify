import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.recipe = res.data.recipe;
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.image = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch (error) {
            alert(error);
        }
    }

    calcTime() {
        const numOfIngredients = this.ingredients.length;
        const periods = Math.ceil(numOfIngredients / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];
        
        const newIngredients = this.ingredients.map(el => {
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');            

            const arrayIngredient = ingredient.split(' ');
            const unitIndex = arrayIngredient.findIndex(unit => unitsShort.includes(unit));

            let objectIng;
            if (unitIndex > -1) {                
                const arrCount = arrayIngredient.slice(0, unitIndex);

                let count;
                if (arrCount.length === 1) {                    
                    count = eval(arrayIngredient[0].replace('-', '+'));
                } else {
                    count = eval(arrayIngredient.slice(0, unitIndex).join('+'));
                }
                objectIng = {
                    count,
                    unit: arrayIngredient[unitIndex],
                    ingredient: arrayIngredient.slice(unitIndex + 1).join(' ')
                };
            } else if (parseInt(arrayIngredient[0], 10)) {
                objectIng = {
                    count: parseInt(arrayIngredient[0], 10),
                    unit: '',
                    ingredient: arrayIngredient.slice(1).join(' ')
                };
            } else if (unitIndex === -1) {
                objectIng = {
                    count: 1,
                    unit: '',
                    ingredient
                };
            }

            return objectIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings (type) {
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    };
}