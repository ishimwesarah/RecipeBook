const RECIPES = [
  {
    id: 1,
    title: 'Spaghetti Carbonara',
    imageUrl: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    cookTime: '25 minutes',
    ingredients: ['200g spaghetti', '100g pancetta', '2 large eggs', '50g pecorino cheese', 'Black pepper'],
    instructions: [ 'Cook spaghetti according to package directions.', 'Fry pancetta in a pan until crisp.', 'Whisk eggs and pecorino cheese.', 'Drain pasta and combine all ingredients quickly.' ],
    likeCount: 1, isLiked: false, comments: [{id: 1, text: "So creamy and delicious!"}]
  },
  {
    id: 2,
    title: 'Classic Pancakes',
    imageUrl: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    cookTime: '15 minutes',
    ingredients: ['1 1/2 cups flour', '2 tbsp sugar', '1 1/4 cups milk', '1 egg', '2 tbsp melted butter'],
    instructions: [ 'In a large bowl, mix dry ingredients.', 'In a separate bowl, mix wet ingredients.', 'Combine wet and dry, then cook on a lightly oiled griddle.' ],
    likeCount: 108, isLiked: false, comments: []
  },
  {
    id: 3,
    title: 'Simple Green Salad',
    imageUrl: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    cookTime: '10 minutes',
    ingredients: ['1 head of lettuce', '1 cucumber', '1 tomato', '1/4 red onion', 'For dressing: 3 tbsp olive oil, 1 tbsp lemon juice, salt, pepper'],
    instructions: [
        'Wash and chop all vegetables.',
        'In a large bowl, combine the lettuce, cucumber, tomato, and red onion.',
        'In a small bowl, whisk together olive oil, lemon juice, salt, and pepper.',
        'Pour dressing over the salad and toss to combine.',
        'Serve immediately.',],
         likeCount: 108, isLiked: false, comments: []
  }
];

const USER_PROFILE = {
    name: 'Text',
    email: 'Sarah@example.com',
    bio: 'A passionate home cook exploring new flavors and sharing my journey.',
    profilePictureUrl:  'https://i.pinimg.com/736x/a0/dd/1b/a0dd1b06ffb50116537e15d377fa3b11.jpg',
};

const SHOPPING_LIST = [
    { id: 1, item: 'Milk', checked: false },
    { id: 2, item: 'Eggs', checked: true },
];

export const getRecipes = () => RECIPES;
export const getRecipeById = (id) => RECIPES.find(r => r.id === id);
export const getUserProfile = () => USER_PROFILE;
export const getShoppingList = () => SHOPPING_LIST;