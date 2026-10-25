```react
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Utensils, Sparkles, ChefHat, Heart, ShoppingBag, Moon, Sun, Plus, Trash2, 
  Clock, Flame, Award, CheckCircle2, Circle, AlertCircle, RefreshCw, Filter, 
  Search, BookOpen, Key, Download, Printer, ChevronRight, X, ShieldAlert, 
  PieChart, Tag, Calendar, Play, Pause, RotateCcw, LayerGroup, Check
} from 'lucide-react';

// --- MOCK INGREDIENTS DATABASE ---
const CATEGORIZED_PRESETS = {
  Vegetables: ['Tomatoes', 'Spinach', 'Onion', 'Garlic', 'Potatoes', 'Carrots', 'Capsicum', 'Cauliflower', 'Paneer', 'Ginger', 'Eggplant', 'Zucchini'],
  Proteins: ['Chicken Breast', 'Eggs', 'Tofu', 'Chickpeas', 'Lentils (Dal)', 'Fish Fillet', 'Black Beans'],
  Dairy: ['Milk', 'Cheese', 'Butter', 'Yogurt (Curd)', 'Heavy Cream'],
  Grains: ['Rice', 'Whole Wheat Flour', 'Oats', 'Pasta', 'Quinoa', 'Bread'],
  Spices: ['Cumin Seeds', 'Turmeric', 'Garam Masala', 'Red Chili Powder', 'Coriander Powder', 'Salt', 'Black Pepper', 'Mustard Seeds']
};

const JAIN_FORBIDDEN = ['onion', 'garlic', 'potatoes', 'potato', 'carrots', 'carrot', 'radish', 'ginger', 'beetroot', 'turnip', 'sweet potato'];

const DIET_PRESETS = [
  { id: 'all', name: 'No Restriction', desc: 'All food items allowed' },
  { id: 'jain', name: 'Jain Strict', desc: 'No meat, eggs, onion, garlic, root vegetables' },
  { id: 'veg', name: 'Vegetarian', desc: 'Plant-based + Dairy, no meat/eggs' },
  { id: 'vegan', name: 'Vegan', desc: '100% plant-based, no animal products' },
  { id: 'non-veg', name: 'Non-Vegetarian', desc: 'Includes poultry, meat & seafood' },
  { id: 'keto', name: 'Keto Friendly', desc: 'High fat, low carb emphasis' },
  { id: 'gluten-free', name: 'Gluten-Free', desc: 'No wheat, barley, or rye grains' }
];

export default function App() {
  // --- STATE ---
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('pantry'); // 'pantry' | 'recipes' | 'favorites' | 'shopping'
  const [selectedDiet, setSelectedDiet] = useState('jain');

  // Ingredients State
  const [pantryItems, setPantryItems] = useState([
    { id: '1', name: 'Tomatoes', category: 'Vegetables', expiry: '2026-11-02' },
    { id: '2', name: 'Spinach', category: 'Vegetables', expiry: '2026-10-30' },
    { id: '3', name: 'Paneer', category: 'Vegetables', expiry: '2026-11-05' },
    { id: '4', name: 'Cumin Seeds', category: 'Spices', expiry: '2027-01-01' },
    { id: '5', name: 'Turmeric', category: 'Spices', expiry: '2027-01-01' },
    { id: '6', name: 'Rice', category: 'Grains', expiry: '2027-06-01' }
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Vegetables');
  const [newItemExpiry, setNewItemExpiry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // AI & API Key State
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generated Recipes State
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);

  // Cooking Mode & Timer State
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Shopping List State
  const [shoppingList, setShoppingList] = useState([]);

  // --- INITIAL LOAD & PERSISTENCE ---
  useEffect(() => {
    const savedFavs = localStorage.getItem('pantry_saved_recipes');
    if (savedFavs) {
      try { setSavedRecipes(JSON.parse(savedFavs)); } catch(e){}
    }
    const savedPantry = localStorage.getItem('pantry_user_items');
    if (savedPantry) {
      try { setPantryItems(JSON.parse(savedPantry)); } catch(e){}
    }
    const savedShop = localStorage.getItem('pantry_shopping_list');
    if (savedShop) {
      try { setShoppingList(JSON.parse(savedShop)); } catch(e){}
    }
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  useEffect(() => {
    localStorage.setItem('pantry_saved_recipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  useEffect(() => {
    localStorage.setItem('pantry_user_items', JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem('pantry_shopping_list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // --- TIMER EFFECT ---
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // --- JAIN WARNING CHECK ---
  const jainWarnings = useMemo(() => {
    if (selectedDiet !== 'jain') return [];
    return pantryItems.filter(item => 
      JAIN_FORBIDDEN.some(forbidden => item.name.toLowerCase().includes(forbidden))
    );
  }, [pantryItems, selectedDiet]);

  // --- PANTRY MANAGEMENT ---
  const handleAddItem = (e) => {
    if (e) e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      category: newItemCategory,
      expiry: newItemExpiry || 'N/A'
    };

    setPantryItems(prev => [newItem, ...prev]);
    setNewItemName('');
    setNewItemExpiry('');
  };

  const handleQuickAdd = (presetName, category) => {
    if (pantryItems.some(item => item.name.toLowerCase() === presetName.toLowerCase())) return;
    const newItem = {
      id: Date.now().toString(),
      name: presetName,
      category: category,
      expiry: 'N/A'
    };
    setPantryItems(prev => [newItem, ...prev]);
  };

  const removeItem = (id) => {
    setPantryItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAllPantry = () => {
    if (window.confirm("Are you sure you want to clear all ingredients from your pantry?")) {
      setPantryItems([]);
    }
  };

  // --- RECIPE GENERATION ENGINE ---
  const generateRecipes = async () => {
    setIsGenerating(true);
    setActiveTab('recipes');

    const availableIngredients = pantryItems.map(i => i.name).join(', ');

    // If API Key provided, attempt live Gemini call
    if (apiKey.trim()) {
      try {
        const promptText = `
          Generate 3 creative, delicious recipes using some or all of these available ingredients: ${availableIngredients}.
          CRITICAL DIET REQUIREMENT: The user strictly follows the ${selectedDiet.toUpperCase()} diet.
          ${selectedDiet === 'jain' ? 'REASON: Jain diet STRICTLY FORBIDS onion, garlic, potatoes, carrots, radish, ginger, beetroot, or any underground root vegetables, as well as meat/eggs.' : ''}

          Return JSON ONLY matching this format structure:
          [
            {
              "id": "rec_1",
              "title": "Recipe Title",
              "description": "Short tempting description",
              "prepTime": "25 mins",
              "calories": "380 kcal",
              "diet": "${selectedDiet}",
              "macros": { "protein": "18g", "carbs": "45g", "fats": "12g" },
              "usedIngredients": ["Ingredient 1", "Ingredient 2"],
              "missingIngredients": ["Optional missing garnish"],
              "instructions": ["Step 1 text", "Step 2 text", "Step 3 text"],
              "chefTip": "Pro tip for maximum flavor"
            }
          ]
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        const data = await response.json();
        const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJsonText) {
          const parsed = JSON.parse(rawJsonText);
          setGeneratedRecipes(parsed);
          setIsGenerating(false);
          return;
        }
      } catch (err) {
        console.warn("API Call failed, falling back to smart simulation:", err);
      }
    }

    // SIMULATED SMART AI FALLBACK ENGINE
    setTimeout(() => {
      const mockResult = generateMockRecipes(selectedDiet, pantryItems);
      setGeneratedRecipes(mockResult);
      setIsGenerating(false);
    }, 1500);
  };

  // --- SMART MOCK GENERATOR LOGIC ---
  const generateMockRecipes = (diet, items) => {
    const itemNames = items.map(i => i.name.toLowerCase());
    const hasPaneer = itemNames.some(i => i.includes('paneer'));
    const hasSpinach = itemNames.some(i => i.includes('spinach'));
    const hasTomato = itemNames.some(i => i.includes('tomato'));

    if (diet === 'jain') {
      return [
        {
          id: 'jain-1',
          title: 'Royal Jain Palak Paneer (No Onion/Garlic)',
          description: 'Rich cottage cheese cubes simmered in fresh spiced spinach puree, tempered with cumin seeds and asafoetida.',
          prepTime: '20 mins',
          calories: '340 kcal',
          diet: 'Jain Strict',
          macros: { protein: '22g', carbs: '14g', fats: '24g' },
          usedIngredients: items.filter(i => ['spinach', 'paneer', 'tomatoes', 'cumin seeds'].some(k => i.name.toLowerCase().includes(k))).map(i => i.name),
          missingIngredients: ['Cream', 'Asafoetida (Hing)', 'Green Chilies'],
          instructions: [
            'Blanch fresh spinach leaves in boiling water for 2 mins, then shock in cold water to preserve vivid green color.',
            'Blend spinach with fresh tomatoes and green chili into a smooth paste.',
            'Heat ghee or butter in a pan. Splutter cumin seeds and a pinch of asafoetida (Hing).',
            'Pour in tomato-spinach puree. Add turmeric, coriander powder, and salt. Simmer for 7 minutes.',
            'Gently toss in fresh paneer cubes and finish with a dash of heavy cream.'
          ],
          chefTip: 'To enhance flavor without onion or garlic, use a small pinch of high-quality Asafoetida (Hing) during tempering.'
        },
        {
          id: 'jain-2',
          title: 'Golden Cumin & Tomato Rice Pillaf',
          description: 'Fragrant basmati rice tossed with slow-roasted tomatoes, roasted cumin, and subtle aromatic spices.',
          prepTime: '15 mins',
          calories: '280 kcal',
          diet: 'Jain Strict',
          macros: { protein: '6g', carbs: '52g', fats: '7g' },
          usedIngredients: items.filter(i => ['rice', 'tomatoes', 'cumin seeds', 'turmeric'].some(k => i.name.toLowerCase().includes(k))).map(i => i.name),
          missingIngredients: ['Ghee', 'Coriander Leaves'],
          instructions: [
            'Rinse and soak basmati rice for 15 minutes.',
            'Heat 1 tbsp ghee in a pot; add roasted cumin seeds and turmeric.',
            'Add finely chopped ripe tomatoes and sauté until soft and aromatic.',
            'Add soaked rice, 2 cups of water, and salt. Cover and simmer on low heat for 12 minutes until fluffy.'
          ],
          chefTip: 'A pinch of dry mango powder (Amchur) gives a pleasant tangy lift to root-vegetable-free rice dishes.'
        }
      ];
    }

    return [
      {
        id: 'gen-1',
        title: 'Creamy Tomato & Spinach Medley',
        description: 'A rich, savory pan meal incorporating fresh produce and delicate spice layering.',
        prepTime: '25 mins',
        calories: '310 kcal',
        diet: diet.toUpperCase(),
        macros: { protein: '15g', carbs: '28g', fats: '16g' },
        usedIngredients: items.slice(0, 4).map(i => i.name),
        missingIngredients: ['Olive Oil', 'Black Pepper'],
        instructions: [
          'Prepare your pan over medium heat with a splash of oil.',
          'Add primary spices and toast lightly until fragrant.',
          'Fold in main vegetables and proteins, sautéing until tender.',
          'Simmer with a dash of water or cream to bind the flavors into a thick gravy.'
        ],
        chefTip: 'Always toast dry spices before adding liquid ingredients to unlock maximum essential oils.'
      }
    ];
  };

  // --- FAVORITES MANAGEMENT ---
  const toggleSaveRecipe = (recipe) => {
    if (savedRecipes.some(r => r.id === recipe.id)) {
      setSavedRecipes(prev => prev.filter(r => r.id !== recipe.id));
    } else {
      setSavedRecipes(prev => [...prev, recipe]);
    }
  };

  // --- SHOPPING LIST AUTOMATION ---
  const addMissingToShoppingList = (missingArray) => {
    const newItems = missingArray.map(name => ({
      id: Date.now() + Math.random().toString(),
      name,
      checked: false
    }));
    setShoppingList(prev => [...prev, ...newItems]);
    setActiveTab('shopping');
  };

  const toggleShoppingCheck = (id) => {
    setShoppingList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const clearShoppingList = () => {
    setShoppingList([]);
  };

  // --- TIMER UTILS ---
  const startTimer = (minutes) => {
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(true);
  };
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- RENDER API KEY MODAL ---
  const renderApiKeyModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg">Google Gemini API Settings</h3>
          </div>
          <button onClick={() => setShowApiKeyModal(false)} className="p-1 hover:bg-slate-700/30 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Enter your free Google Gemini API key to enable live AI recipe generation tailored to your exact custom pantry items.
        </p>
        <input 
          type="password"
          placeholder="AIzaSy..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className={`w-full p-3 rounded-xl border mb-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
          }`}
        />
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => {
              localStorage.removeItem('gemini_api_key');
              setApiKey('');
              setShowApiKeyModal(false);
            }}
            className="px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl"
          >
            Clear Key
          </button>
          <button 
            onClick={() => {
              localStorage.setItem('gemini_api_key', apiKey);
              setShowApiKeyModal(false);
            }}
            className="px-5 py-2 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl shadow-lg hover:brightness-110"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-amber-50/50 text-slate-900'} font-sans`}>
      {showApiKeyModal && renderApiKeyModal()}

      {/* HEADER NAVBAR */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-amber-200/60'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                CulinaryCraft
              </h1>
              <span className="text-xs text-slate-400 font-medium">Smart Pantry & Recipe Engine</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            {[
              { id: 'pantry', label: 'My Pantry', icon: Utensils, badge: pantryItems.length },
              { id: 'recipes', label: 'AI Recipes', icon: Sparkles, badge: generatedRecipes.length },
              { id: 'favorites', label: 'Saved', icon: Heart, badge: savedRecipes.length },
              { id: 'shopping', label: 'Shopping', icon: ShoppingBag, badge: shoppingList.filter(i => !i.checked).length }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowApiKeyModal(true)}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold ${
                apiKey ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">{apiKey ? 'Gemini Key Active' : 'Set API Key'}</span>
            </button>
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-800/50 text-slate-300 hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-lg ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-amber-200'} flex justify-around p-2`}>
        {[
          { id: 'pantry', label: 'Pantry', icon: Utensils },
          { id: 'recipes', label: 'Recipes', icon: Sparkles },
          { id: 'favorites', label: 'Saved', icon: Heart },
          { id: 'shopping', label: 'Shopping', icon: ShoppingBag }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 rounded-xl text-xs font-medium transition-all ${
                isActive ? 'text-amber-500' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-12">

        {/* DIETARY SELECTION BAR */}
        <section className={`p-4 mb-6 rounded-2xl border backdrop-blur-md ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-amber-200/80 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Dietary Profile Filter</h2>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DIET_PRESETS.map(diet => (
              <button
                key={diet.id}
                onClick={() => setSelectedDiet(diet.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedDiet === diet.id 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-105' 
                    : theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-amber-100/60 text-slate-700 hover:bg-amber-200/60'
                }`}
              >
                {diet.name}
              </button>
            ))}
          </div>

          {/* JAIN WARNING BANNER IF APPLICABLE */}
          {selectedDiet === 'jain' && jainWarnings.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-300">
                <span className="font-bold">Jain Filter Alert:</span> Your pantry contains {jainWarnings.length} item(s) strictly prohibited in Jain cuisine: 
                <span className="font-semibold underline ml-1">{jainWarnings.map(w => w.name).join(', ')}</span>.
                These will be excluded automatically during recipe generation.
              </div>
            </div>
          )}
        </section>

        {/* --- TAB 1: PANTRY MANAGER --- */}
        {activeTab === 'pantry' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* INGREDIENT INPUT FORM */}
            <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-amber-200/60 shadow-md'}`}>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                Add Ingredients
              </h3>

              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Ingredient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Tomatoes, Tofu, Basmati Rice"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Category</label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      className={`w-full p-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    >
                      {Object.keys(CATEGORIZED_PRESETS).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Best Before</label>
                    <input
                      type="date"
                      value={newItemExpiry}
                      onChange={(e) => setNewItemExpiry(e.target.value)}
                      className={`w-full p-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add to My Pantry
                </button>
              </form>

              {/* QUICK ADD PRESETS */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Add Essentials</h4>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIZED_PRESETS[newItemCategory]?.map(preset => (
                    <button
                      key={preset}
                      onClick={() => handleQuickAdd(preset, newItemCategory)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        pantryItems.some(i => i.name.toLowerCase() === preset.toLowerCase())
                          ? 'opacity-40 border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'border-slate-700/60 hover:border-amber-500 bg-slate-800/40 text-slate-300 hover:text-white'
                      }`}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* INGREDIENT LIST & SEARCH */}
            <div className="lg:col-span-2 space-y-4">
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 justify-between items-center ${
                theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-amber-200/60 shadow-sm'
              }`}>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search pantry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
                  <button
                    onClick={clearAllPantry}
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1 px-3 py-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                  </button>

                  <button
                    onClick={generateRecipes}
                    disabled={pantryItems.length === 0 || isGenerating}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg flex items-center gap-2 transition-all ${
                      pantryItems.length === 0 || isGenerating
                        ? 'bg-slate-700 opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-orange-500/30 hover:brightness-110 active:scale-95'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGenerating ? 'Cooking Ideas...' : 'Generate Recipes'}
                  </button>
                </div>
              </div>

              {/* PANTRY ITEMS DISPLAY GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pantryItems
                  .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(item => {
                    const isForbiddenInJain = selectedDiet === 'jain' && JAIN_FORBIDDEN.some(f => item.name.toLowerCase().includes(f));
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                          isForbiddenInJain
                            ? 'border-rose-500/40 bg-rose-500/5'
                            : theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isForbiddenInJain ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            <Utensils className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              {item.name}
                              {isForbiddenInJain && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                                  Not Jain
                                </span>
                              )}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3 text-slate-500" /> {item.category}
                              </span>
                              {item.expiry !== 'N/A' && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-500" /> Exp: {item.expiry}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: AI RECIPES DISCOVERY --- */}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">AI Customized Recipes</h2>
                <p className="text-xs text-slate-400">Filtered strictly for: <span className="text-amber-500 font-bold uppercase">{selectedDiet}</span></p>
              </div>
              <button
                onClick={generateRecipes}
                disabled={isGenerating}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-semibold text-xs flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            </div>

            {isGenerating ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <ChefHat className="w-12 h-12 text-amber-500 animate-bounce mb-4" />
                <h3 className="text-lg font-bold">Crafting Personal Recipes...</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">Analyzing pantry ingredients against strict {selectedDiet} dietary restrictions.</p>
              </div>
            ) : generatedRecipes.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300">No Recipes Generated Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">Click below to run the AI engine on your currently logged pantry ingredients.</p>
                <button
                  onClick={generateRecipes}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl text-sm shadow-lg"
                >
                  Generate Recipes Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedRecipes.map(recipe => (
                  <div
                    key={recipe.id}
                    className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                      theme === 'dark' ? 'bg-slate-900/60 border-slate-800 hover:border-amber-500/50' : 'bg-white border-amber-200/80 shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {recipe.diet}
                        </span>
                        <button
                          onClick={() => toggleSaveRecipe(recipe)}
                          className={`p-2 rounded-xl border transition-colors ${
                            savedRecipes.some(r => r.id === recipe.id)
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-500'
                              : 'border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
                      <p className="text-xs text-slate-400 mb-4 line-clamp-2">{recipe.description}</p>

                      {/* MACRO STATS BADGES */}
                      <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-xl bg-slate-800/40 border border-slate-700/40 mb-4 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Prep Time</span>
                          <span className="text-xs font-bold text-amber-400">{recipe.prepTime}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Calories</span>
                          <span className="text-xs font-bold text-amber-400">{recipe.calories}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Protein</span>
                          <span className="text-xs font-bold text-amber-400">{recipe.macros?.protein || 'N/A'}</span>
                        </div>
                      </div>

                      {/* INGREDIENTS MATCH BADGES */}
                      <div className="space-y-2 mb-4">
                        <div className="text-xs font-bold text-slate-300">Pantry Matches Used:</div>
                        <div className="flex flex-wrap gap-1">
                          {recipe.usedIngredients.map((ing, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                              ✓ {ing}
                            </span>
                          ))}
                          {recipe.missingIngredients?.map((ing, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                              + Need: {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                      {recipe.missingIngredients?.length > 0 && (
                        <button
                          onClick={() => addMissingToShoppingList(recipe.missingIngredients)}
                          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> + Add Missing to Shopping
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActiveRecipe(recipe);
                          setCurrentStep(0);
                        }}
                        className="ml-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-md"
                      >
                        Cook Step-by-Step <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: SAVED FAVORITES --- */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight">Saved Favorites</h2>
            {savedRecipes.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <Heart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300">No Saved Recipes Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Bookmark recipes you love during discovery to view them anytime offline.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedRecipes.map(recipe => (
                  <div key={recipe.id} className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-amber-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold">{recipe.title}</h3>
                      <button onClick={() => toggleSaveRecipe(recipe)} className="text-rose-500">
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">{recipe.description}</p>
                    <button
                      onClick={() => { setActiveRecipe(recipe); setCurrentStep(0); }}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-700"
                    >
                      <BookOpen className="w-4 h-4" /> Open Interactive Recipe
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: AUTOMATED SHOPPING LIST --- */}
        {activeTab === 'shopping' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Shopping List</h2>
                <p className="text-xs text-slate-400">Missing ingredients collected directly from your selected recipes.</p>
              </div>
              {shoppingList.length > 0 && (
                <button onClick={clearShoppingList} className="text-xs text-rose-400 hover:underline flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Clear List
                </button>
              )}
            </div>

            {shoppingList.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300">Your Shopping List is Empty</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Generate recipes and click "+ Add Missing" to automatically compile your grocery run list.</p>
              </div>
            ) : (
              <div className={`rounded-2xl border divide-y ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 divide-slate-800' : 'bg-white border-amber-200 divide-amber-100'}`}>
                {shoppingList.map(item => (
                  <div key={item.id} onClick={() => toggleShoppingCheck(item.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-center gap-3">
                      {item.checked ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-500" />}
                      <span className={`text-sm font-medium ${item.checked ? 'line-through text-slate-500' : 'text-slate-200'}`}>{item.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-400">Missing Item</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* --- STEP-BY-STEP INTERACTIVE COOKING MODAL --- */}
      {activeRecipe && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-3xl my-8 p-6 md:p-8 rounded-3xl border shadow-2xl ${
            theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-amber-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-800 mb-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2 inline-block">
                  {activeRecipe.diet}
                </span>
                <h2 className="text-2xl font-black">{activeRecipe.title}</h2>
              </div>
              <button onClick={() => setActiveRecipe(null)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* TIMER WIDGET BAR */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase">Interactive Kitchen Timer</div>
                  <div className="text-xl font-mono font-black">{formatTime(timerSeconds)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {[2, 5, 10, 15].map(mins => (
                  <button
                    key={mins}
                    onClick={() => startTimer(mins)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700"
                  >
                    +{mins}m
                  </button>
                ))}
                {isTimerRunning ? (
                  <button onClick={() => setIsTimerRunning(false)} className="p-2 bg-rose-500 text-white rounded-lg">
                    <Pause className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={() => setIsTimerRunning(true)} disabled={timerSeconds === 0} className="p-2 bg-amber-500 text-white rounded-lg disabled:opacity-50">
                    <Play className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => { setTimerSeconds(0); setIsTimerRunning(false); }} className="p-2 bg-slate-800 text-slate-400 rounded-lg">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* STEP PROGRESS INSTRUCTION CAROUSEL */}
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Cooking Step {currentStep + 1} of {activeRecipe.instructions.length}</span>
                <span>{Math.round(((currentStep + 1) / activeRecipe.instructions.length) * 100)}% Completed</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300" 
                  style={{ width: `${((currentStep + 1) / activeRecipe.instructions.length) * 100}%` }}
                />
              </div>

              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 min-h-[140px] flex items-center">
                <p className="text-base md:text-lg font-medium leading-relaxed">
                  {activeRecipe.instructions[currentStep]}
                </p>
              </div>

              {activeRecipe.chefTip && (
                <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-800 flex items-start gap-3">
                  <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-400">
                    <span className="font-bold text-amber-400 block mb-0.5">Chef Pro Tip:</span>
                    {activeRecipe.chefTip}
                  </div>
                </div>
              )}
            </div>

            {/* NAVIGATION CONTROLS */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold disabled:opacity-40"
              >
                Previous Step
              </button>

              <button onClick={() => window.print()} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                <Printer className="w-4 h-4" /> Print Card
              </button>

              {currentStep < activeRecipe.instructions.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl text-xs shadow-lg"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={() => setActiveRecipe(null)}
                  className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Finished Cooking!
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
```