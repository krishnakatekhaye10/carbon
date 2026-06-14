export const HABIT_LIBRARY = [
  { id: 'carpool', title: 'Carpool to Work/School', category: 'transport', xp: 80, co2Saved: 15, desc: 'Share rides with colleagues or friends rather than driving solo.', icon: '🚗' },
  { id: 'bike_short', title: 'Bike Under 3km', category: 'transport', xp: 50, co2Saved: 5, desc: 'Walk or bike instead of driving for any trips under 3km.', icon: '🚲' },
  { id: 'no_drive_weekend', title: 'No-Drive Weekend', category: 'transport', xp: 150, co2Saved: 20, desc: 'Commit to zero car travel on Saturday and Sunday.', icon: '🚶' },
  
  { id: 'meatless_monday', title: 'Meatless Mondays', category: 'diet', xp: 60, co2Saved: 6, desc: 'Eat fully plant-based for all meals on Mondays.', icon: '🥗' },
  { id: 'vegan_week', title: 'Go Vegan for a Week', category: 'diet', xp: 200, co2Saved: 25, desc: 'Consume zero animal products for 7 days straight.', icon: '🌱' },
  { id: 'zero_waste_food', title: 'Zero Food Waste', category: 'diet', xp: 80, co2Saved: 8, desc: 'Plan meals, save leftovers, and compost scraps to waste nothing.', icon: '🍎' },
  
  { id: 'cold_wash', title: 'Cold-Water Laundry', category: 'energy', xp: 40, co2Saved: 3, desc: 'Wash all clothes at 30°C or cold cycle. Saves water heating power.', icon: '👕' },
  { id: 'unplug_standby', title: 'Unplug Standby Devices', category: 'energy', xp: 30, co2Saved: 2, desc: 'Turn off power strips or unplug TV/consoles when sleeping.', icon: '🔌' },
  { id: 'led_retrofit', title: 'LED Bulb Retrofit', category: 'energy', xp: 100, co2Saved: 10, desc: 'Replace all remaining incandescent or halogen bulbs with LED.', icon: '💡' },
  
  { id: 'second_hand', title: 'Buy Second-Hand First', category: 'lifestyle', xp: 80, co2Saved: 12, desc: 'Avoid buying new clothes, books, or tools this week; shop thrift.', icon: '🛍️' },
  { id: 'digital_declutter', title: 'Digital Carbon Declutter', category: 'lifestyle', xp: 30, co2Saved: 1, desc: 'Delete old emails, cloud backups, and unsubscribe from spam.', icon: '📧' },
  { id: 'compost_waste', title: 'Composting Habit', category: 'lifestyle', xp: 50, co2Saved: 5, desc: 'Compost food peels and garden trimmings to divert from landfill.', icon: '🍂' },
];

export const BADGE_TIERS = [
  { id: 'sprout', title: 'Eco Sprout', desc: 'Welcome aboard! Joined Earthprint.', req: 'Welcome Badge', icon: '🌱', unlocked: true },
  { id: 'first_habit', title: 'Seedling Sower', desc: 'Adopted your first habit.', req: 'Adopt 1 Habit', icon: '🌿' },
  { id: 'diet_pro', title: 'Plant Powered', desc: 'Completed a diet challenge 3 times.', req: '3 Diet check-offs', icon: '🥦' },
  { id: 'travel_pro', title: 'Eco Commuter', desc: 'Completed a travel challenge 3 times.', req: '3 Travel check-offs', icon: '🚲' },
  { id: 'carbon_slayer', title: 'Climate Healer', desc: 'Saved more than 50kg of CO₂.', req: '50kg CO₂ saved', icon: '⚡' },
  { id: 'climate_hero', title: 'Carbon Zero Hero', desc: 'Level up to Level 4 (1,500+ XP).', req: 'Level 4 / 1500 XP', icon: '👑' }
];
