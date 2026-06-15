/**
 * Utility functions for carbon footprint, water footprint, sustainability quotient,
 * and vulnerability index calculations.
 * All functions are pure, fully validated, and sanitized to handle edge cases like
 * negative inputs, invalid types, empty strings, and null/undefined values.
 */

// --- CARBON EMISSION CONSTANTS ---
export const CARBON_EMISSIONS_FACTORS = {
  TRANSPORT: {
    GAS_CAR: 0.21,   // kg CO2 per km
    HYBRID_CAR: 0.12, // kg CO2 per km
    EV_CAR: 0.04,     // kg CO2 per km
    PUBLIC_TRANSIT: 0.05, // kg CO2 per km
  },
  FLIGHTS: {
    SHORT_HAUL: 250, // kg CO2 per flight
    LONG_HAUL: 1200, // kg CO2 per flight
  },
  DIET: {
    heavyMeat: 3200,   // kg CO2 per year
    lowMeat: 1900,     // kg CO2 per year
    pescatarian: 1400, // kg CO2 per year
    vegetarian: 1100,  // kg CO2 per year
    vegan: 700,        // kg CO2 per year
  },
  ENERGY: {
    ELECTRICITY_KWH: 0.38, // kg CO2 per kWh
    HEATING_GAS: 1600,     // kg CO2 per year
    HEATING_ELECTRIC: 1000, // kg CO2 per year
    HEATING_OIL: 2400,     // kg CO2 per year
    HEATING_SOLAR: 0,      // kg CO2 per year
  },
  LIFESTYLE: {
    NEW_PURCHASE_FACTOR: 15, // kg CO2 per item
    RECYCLING_DISCOUNT: -250, // kg CO2 reduction per year
    MINIMUM_LIFESTYLE_EMISSIONS: 100, // floor value for emissions
  }
};

// --- WATER FOOTPRINT CONSTANTS ---
export const WATER_FOOTPRINT_FACTORS = {
  SHOWER_LITERS_PER_MINUTE: 8,
  LAUNDRY_LITERS_PER_RUN: 70,
  DISH_DISHWASHER_LITERS_PER_RUN: 15,
  DISH_HANDWASH_LITERS_PER_RUN: 45,
  DIET_WATER: {
    heavyMeat: 2200000,   // Liters per year
    lowMeat: 1500000,     // Liters per year
    pescatarian: 1200000, // Liters per year
    vegetarian: 900000,   // Liters per year
    vegan: 650000,        // Liters per year
  }
};

// --- VULNERABILITY INDEX CONSTANTS ---
export const VULNERABILITY_FACTORS = {
  REGION: {
    coastal: 35,
    wildfire: 30,
    heatwave: 25,
    stable: 10,
  },
  WATER: {
    scarcity: 35,
    medium: 15,
    excellent: 5,
  },
  INSULATION: {
    poor: 30,
    medium: 15,
    excellent: 5,
  }
};

/**
 * Sanitizes a numeric input value. Ensures the value is a valid positive number.
 * Handles empty strings, null, undefined, and non-numeric types gracefully.
 * 
 * @param {any} value - The input to sanitize
 * @param {number} [defaultValue=0] - The default value to fall back to
 * @returns {number} The sanitized non-negative number
 */
export function sanitizeNumber(value, defaultValue = 0) {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(parsed)) {
    return defaultValue;
  }
  return Math.max(0, parsed);
}

/**
 * Sanitizes a boolean value, returning false if invalid.
 * 
 * @param {any} value - The input to sanitize
 * @returns {boolean} The sanitized boolean
 */
export function sanitizeBoolean(value) {
  return !!value;
}

/**
 * Sanitizes a string input, stripping any potential HTML tags (basic XSS protection).
 * 
 * @param {any} value - The input to sanitize
 * @param {string} defaultValue - The fallback string
 * @returns {string} The sanitized string
 */
export function sanitizeString(value, defaultValue = '') {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  const str = String(value).trim();
  // Basic tag stripping
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Calculates the breakdown of annual carbon emissions in kg CO2.
 * 
 * @param {Object} data - Input tracking data
 * @param {Object} [data.transport] - Transportation parameters
 * @param {number} [data.transport.carKm] - Weekly kilometers driven
 * @param {string} [data.transport.fuelType] - Fuel type: 'gas' | 'hybrid' | 'electric'
 * @param {number} [data.transport.publicKm] - Weekly kilometers in public transit
 * @param {Object} [data.flights] - Flights parameters
 * @param {number} [data.flights.shortHaul] - Short-haul flights per year
 * @param {number} [data.flights.longHaul] - Long-haul flights per year
 * @param {Object} [data.diet] - Diet parameters
 * @param {string} [data.diet.dietType] - Diet intensity: 'heavyMeat' | 'lowMeat' | 'pescatarian' | 'vegetarian' | 'vegan'
 * @param {Object} [data.energy] - Energy parameters
 * @param {number} [data.energy.electricity] - Monthly electricity usage in kWh
 * @param {string} [data.energy.heatingSource] - Heating source: 'gas' | 'electric' | 'oil' | 'solar'
 * @param {Object} [data.lifestyle] - Lifestyle parameters
 * @param {number} [data.lifestyle.newPurchases] - Monthly purchases count
 * @param {boolean} [data.lifestyle.recycling] - Whether the user recycles
 * @returns {Object} Annual breakdown of carbon emissions in kg CO2 (rounded to nearest integer)
 */
export function calculateCarbonBreakdown(data) {
  if (!data) return { transport: 0, flights: 0, diet: 0, energy: 0, lifestyle: 0 };

  const transport = data.transport || {};
  const flights = data.flights || {};
  const diet = data.diet || {};
  const energy = data.energy || {};
  const lifestyle = data.lifestyle || {};

  // 1. Transportation Annual Emissions
  const carKm = sanitizeNumber(transport.carKm);
  const fuelType = sanitizeString(transport.fuelType, 'electric');
  let carFactor = CARBON_EMISSIONS_FACTORS.TRANSPORT.EV_CAR;
  if (fuelType === 'gas') {
    carFactor = CARBON_EMISSIONS_FACTORS.TRANSPORT.GAS_CAR;
  } else if (fuelType === 'hybrid') {
    carFactor = CARBON_EMISSIONS_FACTORS.TRANSPORT.HYBRID_CAR;
  }
  const carAnnual = carKm * 52 * carFactor;
  const publicKm = sanitizeNumber(transport.publicKm);
  const transitAnnual = publicKm * 52 * CARBON_EMISSIONS_FACTORS.TRANSPORT.PUBLIC_TRANSIT;
  const transportTotal = carAnnual + transitAnnual;

  // 2. Flights Annual Emissions
  const shortHaul = sanitizeNumber(flights.shortHaul);
  const longHaul = sanitizeNumber(flights.longHaul);
  const flightsTotal = (shortHaul * CARBON_EMISSIONS_FACTORS.FLIGHTS.SHORT_HAUL) +
                       (longHaul * CARBON_EMISSIONS_FACTORS.FLIGHTS.LONG_HAUL);

  // 3. Diet Annual Emissions
  const dietType = sanitizeString(diet.dietType, 'lowMeat');
  const dietTotal = CARBON_EMISSIONS_FACTORS.DIET[dietType] !== undefined
    ? CARBON_EMISSIONS_FACTORS.DIET[dietType]
    : CARBON_EMISSIONS_FACTORS.DIET.lowMeat;

  // 4. Energy Annual Emissions
  const electricity = sanitizeNumber(energy.electricity);
  const electricityAnnual = electricity * 12 * CARBON_EMISSIONS_FACTORS.ENERGY.ELECTRICITY_KWH;
  const heatingSource = sanitizeString(energy.heatingSource, 'gas');
  const heatingAnnual = CARBON_EMISSIONS_FACTORS.ENERGY[`HEATING_${heatingSource.toUpperCase()}`] !== undefined
    ? CARBON_EMISSIONS_FACTORS.ENERGY[`HEATING_${heatingSource.toUpperCase()}`]
    : CARBON_EMISSIONS_FACTORS.ENERGY.HEATING_GAS;
  const energyTotal = electricityAnnual + heatingAnnual;

  // 5. Lifestyle Annual Emissions
  const newPurchases = sanitizeNumber(lifestyle.newPurchases);
  const shoppingAnnual = newPurchases * 12 * CARBON_EMISSIONS_FACTORS.LIFESTYLE.NEW_PURCHASE_FACTOR;
  const recycling = sanitizeBoolean(lifestyle.recycling);
  const recyclingDiscount = recycling ? CARBON_EMISSIONS_FACTORS.LIFESTYLE.RECYCLING_DISCOUNT : 0;
  const lifestyleTotal = Math.max(
    CARBON_EMISSIONS_FACTORS.LIFESTYLE.MINIMUM_LIFESTYLE_EMISSIONS,
    shoppingAnnual + recyclingDiscount
  );

  return {
    transport: Math.round(transportTotal),
    flights: Math.round(flightsTotal),
    diet: Math.round(dietTotal),
    energy: Math.round(energyTotal),
    lifestyle: Math.round(lifestyleTotal)
  };
}

/**
 * Calculates the total annual carbon footprint in kg CO2.
 * 
 * @param {Object} data - Input tracking data
 * @returns {number} Total annual emissions in kg CO2
 */
export function calculateCarbonFootprint(data) {
  const breakdown = calculateCarbonBreakdown(data);
  return Object.values(breakdown).reduce((sum, val) => sum + val, 0);
}

/**
 * Calculates the annual water footprint in Liters.
 * 
 * @param {Object} data - Input water tracking variables
 * @param {number} data.showers - Showers per week
 * @param {number} data.length - Minutes per shower
 * @param {number} data.laundry - Loads of laundry per week
 * @param {number} data.dishwash - Dishwasher runs per week
 * @param {boolean} data.handwash - true if washing dishes by hand, false if using a machine
 * @param {string} data.dietType - Diet intensity: 'heavyMeat' | 'lowMeat' | 'pescatarian' | 'vegetarian' | 'vegan'
 * @returns {number} Annual water footprint in Liters
 */
export function calculateWaterFootprint(data) {
  if (!data) return 0;
  
  const showers = sanitizeNumber(data.showers);
  const length = sanitizeNumber(data.length);
  const laundry = sanitizeNumber(data.laundry);
  const dishwash = sanitizeNumber(data.dishwash);
  const handwash = sanitizeBoolean(data.handwash);
  const dietType = sanitizeString(data.dietType, 'lowMeat');

  const showerAnnual = showers * length * WATER_FOOTPRINT_FACTORS.SHOWER_LITERS_PER_MINUTE * 52;
  const laundryAnnual = laundry * WATER_FOOTPRINT_FACTORS.LAUNDRY_LITERS_PER_RUN * 52;
  
  const washFactor = handwash 
    ? WATER_FOOTPRINT_FACTORS.DISH_HANDWASH_LITERS_PER_RUN 
    : WATER_FOOTPRINT_FACTORS.DISH_DISHWASHER_LITERS_PER_RUN;
  const dishAnnual = dishwash * washFactor * 52;

  const dietWater = WATER_FOOTPRINT_FACTORS.DIET_WATER[dietType] !== undefined
    ? WATER_FOOTPRINT_FACTORS.DIET_WATER[dietType]
    : WATER_FOOTPRINT_FACTORS.DIET_WATER.lowMeat;

  return showerAnnual + laundryAnnual + dishAnnual + dietWater;
}

/**
 * Calculates the Sustainability Quotient (SQ) score out of 100 points.
 * 
 * @param {Object} sqAnswers - Sustainability answers
 * @param {number} [sqAnswers.q1] - Points for light/appliances habit
 * @param {number} [sqAnswers.q2] - Points for organic/local food priority
 * @param {number} [sqAnswers.q3] - Points for transit type
 * @param {number} [sqAnswers.q4] - Points for single-use plastic avoidance
 * @param {number} [sqAnswers.q5] - Points for composting habit
 * @returns {number} Sustainability Quotient score (0 to 100)
 */
export function calculateSqScore(sqAnswers) {
  if (!sqAnswers) return 0;
  
  const q1 = sanitizeNumber(sqAnswers.q1);
  const q2 = sanitizeNumber(sqAnswers.q2);
  const q3 = sanitizeNumber(sqAnswers.q3);
  const q4 = sanitizeNumber(sqAnswers.q4);
  const q5 = sanitizeNumber(sqAnswers.q5);

  const rawScore = q1 + q2 + q3 + q4 + q5;
  return Math.min(100, Math.max(0, rawScore));
}

/**
 * Calculates the Vulnerability Index score out of 100.
 * 
 * @param {Object} vulnAnswers - Vulnerability answers
 * @param {string} [vulnAnswers.region] - Geographic region risk level
 * @param {string} [vulnAnswers.water] - Water reliability risk level
 * @param {string} [vulnAnswers.insulation] - Residence insulation resilience
 * @returns {number} Vulnerability score (0 to 100)
 */
export function calculateVulnerabilityScore(vulnAnswers) {
  if (!vulnAnswers) return 0;

  const regionVal = sanitizeString(vulnAnswers.region, 'stable');
  const waterVal = sanitizeString(vulnAnswers.water, 'excellent');
  const insulationVal = sanitizeString(vulnAnswers.insulation, 'excellent');

  const regionScore = VULNERABILITY_FACTORS.REGION[regionVal] !== undefined
    ? VULNERABILITY_FACTORS.REGION[regionVal]
    : VULNERABILITY_FACTORS.REGION.stable;

  const waterScore = VULNERABILITY_FACTORS.WATER[waterVal] !== undefined
    ? VULNERABILITY_FACTORS.WATER[waterVal]
    : VULNERABILITY_FACTORS.WATER.excellent;

  const insulationScore = VULNERABILITY_FACTORS.INSULATION[insulationVal] !== undefined
    ? VULNERABILITY_FACTORS.INSULATION[insulationVal]
    : VULNERABILITY_FACTORS.INSULATION.excellent;

  return regionScore + waterScore + insulationScore;
}
