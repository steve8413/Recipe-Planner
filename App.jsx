import React, { useState, useEffect, useMemo } from 'react';
import { 
  Utensils, Sparkles, ChefHat, Heart, ShoppingBag, Moon, Sun, Plus, Trash2, 
  Clock, Flame, Award, CheckCircle2, Circle, AlertCircle, RefreshCw, Filter, 
  Search, BookOpen, Key, Printer, ChevronRight, X, ShieldAlert, 
  Tag, Calendar, Play, Pause, RotateCcw, Check, LogOut, User, Mail, MessageSquare, Send
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
  // --- AUTHENTICATION STATE ---
  const [user, setUser] = useState(null); // { email, name, avatar }
  const [loginEmail, setLoginEmail] = useState('');

  // --- APP NAVIGATION & UI STATE ---
  const [theme, setTheme] = useState('dark');
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' | 'pantry' | 'recipes' | 'favorites' | 'shopping' | 'profile'
  const [selectedDiet, setSelectedDiet] = useState('jain');

  // Pantry State
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

  // Recipes & Saved
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);

  // Interactive Cooking Assistant & Question Box State
  const [currentStep, setCurrentStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [cookingAssistantMessage, setCookingAssistantMessage] = useState('');
  const [userQuestion, setUserQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // Shopping List
  const [shoppingList, setShoppingList] = useState([]);

  // --- PERSISTENCE ---
  useEffect(() => {
    const savedUser = localStorage.getItem('culinary_craft_user');
    if (savedUser) { try { setUser(JSON.parse(savedUser)); } catch(e){} }

    const savedFavs = localStorage.getItem('pantry_saved_recipes');
    if (savedFavs) { try { setSavedRecipes(JSON.parse(savedFavs)); } catch(e){} }

    const savedPantry = localStorage.getItem('pantry_user_items');
    if (savedPantry) { try { setPantryItems(JSON.parse(savedPantry)); } catch(e){} }

    const savedShop = localStorage.getItem('pantry_shopping_list');
    if (savedShop) { try { setShoppingList(JSON.parse(savedShop)); } catch(e){} }

    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('culinary_craft_user', JSON.stringify(user));
    else localStorage.removeItem('culinary_craft_user');
  }, [user]);

  useEffect(() => { localStorage.setItem('pantry_saved_recipes', JSON.stringify(savedRecipes)); }, [savedRecipes]);
  useEffect(() => { localStorage.setItem('pantry_user_items', JSON.stringify(pantryItems)); }, [pantryItems]);
  useEffect(() => { localStorage.setItem('pantry_shopping_list', JSON.stringify(shoppingList)); }, [shoppingList]);

  // --- COOKING TIMER & ASSISTANT NOTIFICATION EFFECT ---
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev === 30) {
            setCookingAssistantMessage("🔔 Kitchen Alert: 30 seconds left! Make sure to check if your food is crisp and ready.");
          }
          if (prev === 1) {
            setCookingAssistantMessage("✨ Timer complete! How does it smell? Does it taste good? Check if salt, spice, or consistency needs any adjustment!");
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // --- AUTH HANDLERS ---
  const handleGoogleLogin = () => {
    const mockGoogleUser = {
      email: 'chef.user@gmail.com',
      name: 'Chef Explorer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
    };
    setUser(mockGoogleUser);
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    const namePart = loginEmail.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    setUser({
      email: loginEmail.trim(),
      name: formattedName,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
    });
    setLoginEmail('');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
  };

  // --- JAIN WARNING CHECK ---
  const jainWarnings = useMemo(() => {
    if (selectedDiet !== 'jain') return [];
    return pantryItems.filter(item => 
      JAIN_FORBIDDEN.some(forbidden => item.name.toLowerCase().includes(forbidden))
    );
  }, [pantryItems, selectedDiet]);

  // --- PANTRY ACTIONS ---
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
    setPantryItems(prev => [{ id: Date.now().toString(), name: presetName, category, expiry: 'N/A' }, ...prev]);
  };

  const removeItem = (id) => setPantryItems(prev => prev.filter(item => item.id !== id));
  const clearAllPantry = () => {
    if (window.confirm("Clear all pantry items?")) setPantryItems([]);
  };

  // --- AI RECIPE ENGINE ---
  const generateRecipes = async () => {
    setIsGenerating(true);
    setCurrentPage('recipes');
    const availableIngredients = pantryItems.map(i => i.name).join(', ');

    if (apiKey.trim()) {
      try {
        const promptText = `
          Generate 3 creative, delicious recipes using some or all of these available ingredients: ${availableIngredients}.
          CRITICAL DIET REQUIREMENT: The user strictly follows the ${selectedDiet.toUpperCase()} diet.
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
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
          setGeneratedRecipes(JSON.parse(rawJsonText));
          setIsGenerating(false);
          return;
        }
      } catch (err) {
        console.warn("API fallback triggered:", err);
      }
    }

    setTimeout(() => {
      setGeneratedRecipes([
        {
          id: 'sim-1',
          title: selectedDiet === 'jain' ? 'Royal Jain Palak Paneer' : 'Creamy Tomato Spinach Medley',
          description: 'A savory dish perfectly customized to your logged pantry items and strict dietary preference.',
          prepTime: '20 mins',
          calories: '320 kcal',
          diet: selectedDiet.toUpperCase(),
          macros: { protein: '20g', carbs: '15g', fats: '18g' },
          usedIngredients: pantryItems.slice(0, 3).map(i => i.name),
          missingIngredients: ['Fresh Cream', 'Coriander'],
          instructions: [
            'Prepare and rinse all available fresh vegetables.',
            'Heat ghee or oil in a pan, add cumin seeds and spices.',
            'Simmer ingredients on medium heat for 10 minutes until thick and aromatic.',
            'Taste for salt and spices, garnish, and serve hot.'
          ],
          chefTip: 'Stir continuously for the first 5 minutes to prevent sticking and unlock natural essential oils.'
        }
      ]);
      setIsGenerating(false);
    }, 1200);
  };

  // --- ASK QUESTION BOX HANDLER ---
  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;
    const q = userQuestion.trim();
    setUserQuestion('');
    
    let answer = "Great question! For this recipe, you can adjust the spice level by adding a pinch of black pepper or lemon juice if it feels too heavy.";
    if (q.toLowerCase().includes('salt')) answer = "If it has too much salt, add a boiled potato chunk or a splash of cream/yogurt to balance it out!";
    if (q.toLowerCase().includes('spicy')) answer = "To reduce heat, stir in a spoonful of yogurt, heavy cream, or coconut milk.";

    setChatHistory(prev => [...prev, { q, a: answer }]);
  };

  // --- RENDER LOGIN GATEWAY IF NOT LOGGED IN ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-xl shadow-orange-500/20 mb-2">
              <ChefHat className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Welcome to CulinaryCraft
            </h1>
            <p className="text-xs text-slate-400">Your Free Smart Pantry & AI Recipe Assistant</p>
          </div>

          <div className="space-y-4 pt-2">
            {/* GOOGLE SIGN IN BUTTON */}
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-slate-800"></div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">or email login</span>
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            {/* EMAIL LOGIN FORM */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Your Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="chef@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:brightness-110 transition-all"
              >
                Create Account & Sync Pantry
              </button>
            </form>
          </div>

          <p className="text-center text-[11px] text-slate-500">
            100% Free • Secure Local & Cloud Profile Syncing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md">
              <ChefHat className="w-5 h-5" />
            </div>
            <h1 className="font-black text-lg tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              CulinaryCraft
            </h1>
          </div>

          {/* DESKTOP NAV TABS */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-800/50 border border-slate-700/60 rounded-xl">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'pantry', label: 'My Pantry', count: pantryItems.length },
              { id: 'recipes', label: 'AI Recipes', count: generatedRecipes.length },
              { id: 'favorites', label: 'Saved', count: savedRecipes.length },
              { id: 'shopping', label: 'Shopping List', count: shoppingList.filter(i => !i.checked).length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === tab.id ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label} {tab.count > 0 ? `(${tab.count})` : ''}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowApiKeyModal(true)}
              className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 text-xs font-semibold flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" /> {apiKey ? 'Gemini Active' : 'API Key'}
            </button>
            <button
              onClick={() => setCurrentPage('profile')}
              className={`p-2 rounded-xl border ${currentPage === 'profile' ? 'border-amber-500 bg-amber-500/20 text-amber-400' : 'border-slate-800 bg-slate-900 text-slate-300'}`}
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-800 bg-slate-900/95 backdrop-blur-lg flex justify-around p-2">
        {[
          { id: 'dashboard', label: 'Home', icon: ChefHat },
          { id: 'pantry', label: 'Pantry', icon: Utensils },
          { id: 'recipes', label: 'Recipes', icon: Sparkles },
          { id: 'favorites', label: 'Saved', icon: Heart },
          { id: 'shopping', label: 'Shop', icon: ShoppingBag }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentPage(tab.id)}
              className={`flex flex-col items-center p-1.5 rounded-xl text-[10px] font-medium transition-all ${
                isActive ? 'text-amber-500 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* --- PAGE 1: DASHBOARD --- */}
        {currentPage === 'dashboard' && (
          <div className="space-y-6">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Welcome back, {user.name}! 👋
                </span>
                <h2 className="text-3xl font-black tracking-tight">What's in your kitchen today?</h2>
                <p className="text-sm text-slate-400 max-w-xl">
                  Manage your ingredients, filter by dietary requirements like Jain or Keto, and let AI generate instant recipes with smart cooking assistance.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={() => setCurrentPage('pantry')}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 text-sm flex items-center justify-center gap-2"
                >
                  <Utensils className="w-4 h-4" /> Open My Pantry
                </button>
                <button
                  onClick={generateRecipes}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" /> Generate AI Recipes
                </button>
              </div>
            </div>

            {/* QUICK STATS & DIET SELECTOR */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 uppercase font-bold">Pantry Inventory</span>
                <div className="text-2xl font-black text-amber-400">{pantryItems.length} Items Logged</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 uppercase font-bold">Active Diet Filter</span>
                <div className="text-2xl font-black text-orange-400 uppercase">{selectedDiet}</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 uppercase font-bold">Saved Recipes</span>
                <div className="text-2xl font-black text-emerald-400">{savedRecipes.length} Bookmarked</div>
              </div>
            </div>
          </div>
        )}

        {/* --- PAGE 2: PANTRY MANAGER --- */}
        {currentPage === 'pantry' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">Pantry Management</h2>
                <p className="text-xs text-slate-400">Add or manage ingredients available in your kitchen.</p>
              </div>
              <button onClick={clearAllPantry} className="text-xs text-rose-400 hover:underline flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ADD FORM */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-500" /> Add Ingredient
                </h3>
                <form onSubmit={handleAddItem} className="space-y-3">
                  <input
                    type="text"
                    placeholder="e.g. Paneer, Tomatoes, Rice"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none"
                  >
                    {Object.keys(CATEGORIZED_PRESETS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm shadow-md">
                    Add to Pantry
                  </button>
                </form>

                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Quick Add Essentials</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIZED_PRESETS[newItemCategory]?.map(preset => (
                      <button
                        key={preset}
                        onClick={() => handleQuickAdd(preset, newItemCategory)}
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 border border-slate-700 hover:border-amber-500 text-slate-300"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* LIST & SEARCH */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search pantry..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm"
                    />
                  </div>
                  <button
                    onClick={generateRecipes}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Generate Recipes
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pantryItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                    <div key={item.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        <span className="text-[11px] text-slate-400">{item.category} • Exp: {item.expiry}</span>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PAGE 3: AI RECIPES --- */}
        {currentPage === 'recipes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black">AI Generated Recipes</h2>
                <p className="text-xs text-slate-400">Filtered for diet: <span className="text-amber-400 font-bold uppercase">{selectedDiet}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedDiet}
                  onChange={(e) => setSelectedDiet(e.target.value)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold"
                >
                  {DIET_PRESETS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button
                  onClick={generateRecipes}
                  disabled={isGenerating}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>
            </div>

            {isGenerating ? (
              <div className="py-20 text-center space-y-3">
                <ChefHat className="w-10 h-10 text-amber-500 animate-bounce mx-auto" />
                <h3 className="font-bold text-base">Creating Custom Recipes...</h3>
              </div>
            ) : generatedRecipes.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400 mb-3">No recipes generated yet.</p>
                <button onClick={generateRecipes} className="px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-xs">
                  Generate Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedRecipes.map(recipe => (
                  <div key={recipe.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {recipe.diet}
                        </span>
                        <button
                          onClick={() => setSavedRecipes(prev => prev.some(r => r.id === recipe.id) ? prev.filter(r => r.id !== recipe.id) : [...prev, recipe])}
                          className={`p-2 rounded-xl border ${savedRecipes.some(r => r.id === recipe.id) ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'border-slate-800 text-slate-400'}`}
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      <h3 className="text-lg font-bold">{recipe.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{recipe.description}</p>
                      
                      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-800/50 text-center">
                        <div><span className="text-[9px] text-slate-400 block uppercase font-bold">Prep</span><span className="text-xs font-bold text-amber-400">{recipe.prepTime}</span></div>
                        <div><span className="text-[9px] text-slate-400 block uppercase font-bold">Calories</span><span className="text-xs font-bold text-amber-400">{recipe.calories}</span></div>
                        <div><span className="text-[9px] text-slate-400 block uppercase font-bold">Protein</span><span className="text-xs font-bold text-amber-400">{recipe.macros?.protein}</span></div>
                      </div>
                    </div>

                    <button
                      onClick={() => { setActiveRecipe(recipe); setCurrentStep(0); setTimerSeconds(180); }}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-2"
                    >
                      Cook Step-by-Step <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- PAGE 4: SAVED FAVORITES --- */}
        {currentPage === 'favorites' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black">Saved Favorites</h2>
            {savedRecipes.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
                No saved recipes yet. Bookmark recipes during discovery!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedRecipes.map(recipe => (
                  <div key={recipe.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <h3 className="font-bold text-lg">{recipe.title}</h3>
                    <p className="text-xs text-slate-400">{recipe.description}</p>
                    <button
                      onClick={() => { setActiveRecipe(recipe); setCurrentStep(0); setTimerSeconds(180); }}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700"
                    >
                      Open Interactive Cooking
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- PAGE 5: SHOPPING LIST --- */}
        {currentPage === 'shopping' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-black">Grocery Shopping List</h2>
            {shoppingList.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
                Your shopping list is empty.
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800">
                {shoppingList.map(item => (
                  <div key={item.id} onClick={() => setShoppingList(prev => prev.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i))} className="p-4 flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      {item.checked ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-500" />}
                      <span className={`text-sm ${item.checked ? 'line-through text-slate-500' : 'text-slate-200'}`}>{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- PAGE 6: USER PROFILE --- */}
        {currentPage === 'profile' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
              <img src={user.avatar} alt="Profile" className="w-20 h-20 rounded-full mx-auto border-2 border-amber-500" />
              <div>
                <h3 className="font-bold text-lg">{user.name}</h3>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-around text-xs text-slate-400">
                <div><span className="font-bold text-white block text-sm">{pantryItems.length}</span> Pantry Items</div>
                <div><span className="font-bold text-white block text-sm">{savedRecipes.length}</span> Favorites</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-rose-500/30"
              >
                <LogOut className="w-4 h-4" /> Sign Out Account
              </button>
            </div>
          </div>
        )}

      </main>

      {/* --- INTERACTIVE COOKING ASSISTANT MODAL WITH NOTIFICATIONS & QUESTION BOX --- */}
      {activeRecipe && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8 p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl space-y-6 text-white">
            
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2 inline-block">
                  {activeRecipe.diet}
                </span>
                <h2 className="text-xl md:text-2xl font-black">{activeRecipe.title}</h2>
              </div>
              <button onClick={() => setActiveRecipe(null)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* LIVE ASSISTANT NOTIFICATION BANNER */}
            {cookingAssistantMessage && (
              <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-xs font-semibold text-amber-300 flex items-start gap-3 animate-pulse">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                <div>{cookingAssistantMessage}</div>
              </div>
            )}

            {/* TIMER WIDGET */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-500" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Cooking Timer Assistant</div>
                  <div className="text-xl font-mono font-black">{Math.floor(timerSeconds / 60)}:{timerSeconds % 60 < 10 ? '0' : ''}{timerSeconds % 60}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setTimerSeconds(prev => prev + 60)} className="px-2.5 py-1 bg-slate-700 text-xs rounded-lg">+1m</button>
                {isTimerRunning ? (
                  <button onClick={() => setIsTimerRunning(false)} className="p-2 bg-rose-500 text-white rounded-lg"><Pause className="w-4 h-4" /></button>
                ) : (
                  <button onClick={() => setIsTimerRunning(true)} className="p-2 bg-amber-500 text-white rounded-lg"><Play className="w-4 h-4" /></button>
                )}
                <button onClick={() => setTimerSeconds(180)} className="p-2 bg-slate-700 text-slate-300 rounded-lg"><RotateCcw className="w-4 h-4" /></button>
              </div>
            </div>

            {/* STEP CAROUSEL */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                <span>Step {currentStep + 1} of {activeRecipe.instructions.length}</span>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700 min-h-[120px] flex items-center">
                <p className="text-base font-medium leading-relaxed">{activeRecipe.instructions[currentStep]}</p>
              </div>
            </div>

            {/* INTERACTIVE QUESTION BOX FOR COOKING HELP */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <MessageSquare className="w-4 h-4" /> Ask Kitchen Assistant (e.g. "Is it too salty?", "What to substitute?")
              </div>
              
              {chatHistory.map((item, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="text-slate-400 font-semibold">Q: {item.q}</div>
                  <div className="p-3 rounded-xl bg-slate-900 text-amber-200 border border-slate-700">A: {item.a}</div>
                </div>
              ))}

              <form onSubmit={handleAskQuestion} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask any cooking question..."
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:outline-none"
                />
                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                  <Send className="w-3.5 h-3.5" /> Ask
                </button>
              </form>
            </div>

            {/* MODAL CONTROLS */}
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold disabled:opacity-40"
              >
                Previous
              </button>

              {currentStep < activeRecipe.instructions.length - 1 ? (
                <button
                  onClick={() => { setCurrentStep(prev => prev + 1); setCookingAssistantMessage(''); }}
                  className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={() => setActiveRecipe(null)}
                  className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1"
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
