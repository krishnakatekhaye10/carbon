import {
  calculateCarbonBreakdown,
  calculateCarbonFootprint,
  calculateWaterFootprint,
  calculateSqScore,
  calculateVulnerabilityScore,
  sanitizeNumber,
  sanitizeString,
  sanitizeBoolean
} from '../utils/footprintMath';

describe('Sanitization Utilities', () => {
  test('sanitizeNumber should parse numbers and strings, floor negatives to 0, and fallback safely', () => {
    expect(sanitizeNumber(150)).toBe(150);
    expect(sanitizeNumber('200')).toBe(200);
    expect(sanitizeNumber('abc', 10)).toBe(10);
    expect(sanitizeNumber(-50)).toBe(0);
    expect(sanitizeNumber(null, 5)).toBe(5);
    expect(sanitizeNumber(undefined, 8)).toBe(8);
  });

  test('sanitizeBoolean should convert any value to strict boolean', () => {
    expect(sanitizeBoolean(true)).toBe(true);
    expect(sanitizeBoolean('true')).toBe(true);
    expect(sanitizeBoolean(0)).toBe(false);
    expect(sanitizeBoolean(null)).toBe(false);
  });

  test('sanitizeString should trim strings and strip basic HTML tags', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
    expect(sanitizeString('<div>test</div>')).toBe('test');
    expect(sanitizeString(null, 'default')).toBe('default');
  });
});

describe('Carbon Footprint Calculator', () => {
  const sampleData = {
    transport: { carKm: 150, fuelType: 'gas', publicKm: 50 },
    flights: { shortHaul: 2, longHaul: 1 },
    diet: { dietType: 'lowMeat' },
    energy: { electricity: 300, heatingSource: 'gas' },
    lifestyle: { newPurchases: 5, recycling: true }
  };

  test('calculateCarbonBreakdown should calculate correct category emissions', () => {
    const breakdown = calculateCarbonBreakdown(sampleData);
    
    // Transport: 150 * 52 * 0.21 (1638) + 50 * 52 * 0.05 (130) = 1768
    expect(breakdown.transport).toBe(1768);
    
    // Flights: 2 * 250 (500) + 1 * 1200 (1200) = 1700
    expect(breakdown.flights).toBe(1700);

    // Diet: lowMeat = 1900
    expect(breakdown.diet).toBe(1900);

    // Energy: electricity 300 * 12 * 0.38 (1368) + heating gas (1600) = 2968
    expect(breakdown.energy).toBe(2968);

    // Lifestyle: 5 * 12 * 15 (900) + recycling (-250) = 650
    expect(breakdown.lifestyle).toBe(650);
  });

  test('calculateCarbonBreakdown should correctly calculate hybrid and electric transport modes', () => {
    const hybridData = {
      transport: { carKm: 100, fuelType: 'hybrid', publicKm: 0 }
    };
    const evData = {
      transport: { carKm: 100, fuelType: 'electric', publicKm: 0 }
    };
    // Hybrid: 100 * 52 * 0.12 = 624
    expect(calculateCarbonBreakdown(hybridData).transport).toBe(624);
    // EV: 100 * 52 * 0.04 = 208
    expect(calculateCarbonBreakdown(evData).transport).toBe(208);
  });

  test('calculateCarbonFootprint should sum category emissions correctly', () => {
    const total = calculateCarbonFootprint(sampleData);
    expect(total).toBe(1768 + 1700 + 1900 + 2968 + 650);
  });

  test('calculateCarbonBreakdown should handle missing, empty, or corrupted data structures', () => {
    const emptyBreakdown = calculateCarbonBreakdown({});
    expect(emptyBreakdown.transport).toBe(0);
    expect(emptyBreakdown.flights).toBe(0);
    expect(emptyBreakdown.diet).toBe(1900); // defaults to lowMeat
    expect(emptyBreakdown.energy).toBe(1600); // defaults to gas heating
    expect(emptyBreakdown.lifestyle).toBe(100); // minimum floor value

    const negativeData = {
      transport: { carKm: -100, fuelType: 'gas', publicKm: -50 },
      flights: { shortHaul: -2, longHaul: -1 },
      diet: { dietType: 'invalid_diet' },
      energy: { electricity: -500, heatingSource: 'invalid_heating' },
      lifestyle: { newPurchases: -5, recycling: false }
    };
    const negBreakdown = calculateCarbonBreakdown(negativeData);
    expect(negBreakdown.transport).toBe(0);
    expect(negBreakdown.flights).toBe(0);
    expect(negBreakdown.diet).toBe(1900); // fallback
    expect(negBreakdown.energy).toBe(1600); // fallback to gas heating
    expect(negBreakdown.lifestyle).toBe(100); // fallback to minimum lifestyle floor
  });
});

describe('Water Footprint Calculator', () => {
  test('calculateWaterFootprint should compute annual water consumption correctly', () => {
    const waterData = {
      showers: 7,
      length: 8,
      laundry: 3,
      dishwash: 4,
      handwash: false,
      dietType: 'lowMeat'
    };
    
    // showers: 7 * 8 * 8 * 52 = 23296
    // laundry: 3 * 70 * 52 = 10920
    // dishwasher: 4 * 15 * 52 = 3120
    // diet: lowMeat = 1500000
    // total = 23296 + 10920 + 3120 + 1500000 = 1537336
    expect(calculateWaterFootprint(waterData)).toBe(1537336);
  });

  test('calculateWaterFootprint should handle handwash vs dishwasher difference', () => {
    const machineWash = calculateWaterFootprint({ showers: 0, length: 0, laundry: 0, dishwash: 10, handwash: false, dietType: 'vegan' });
    const handWash = calculateWaterFootprint({ showers: 0, length: 0, laundry: 0, dishwash: 10, handwash: true, dietType: 'vegan' });
    
    // machine: 10 * 15 * 52 = 7800 + vegan 650000 = 657800
    // hand: 10 * 45 * 52 = 23400 + vegan 650000 = 673400
    expect(machineWash).toBe(657800);
    expect(handWash).toBe(673400);
  });
});

describe('Sustainability Quotient Calculator', () => {
  test('calculateSqScore should correctly sum points and clamp between 0 and 100', () => {
    expect(calculateSqScore({ q1: 20, q2: 12, q3: 16, q4: 10, q5: 20 })).toBe(78);
    expect(calculateSqScore({ q1: 20, q2: 20, q3: 20, q4: 20, q5: 20 })).toBe(100);
    expect(calculateSqScore({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 })).toBe(0);
    expect(calculateSqScore({ q1: -10, q2: -5 })).toBe(0);
    expect(calculateSqScore(null)).toBe(0);
  });
});

describe('Vulnerability Index Calculator', () => {
  test('calculateVulnerabilityScore should sum geographic and structural risk factors', () => {
    const highRisk = { region: 'coastal', water: 'scarcity', insulation: 'poor' }; // 35 + 35 + 30 = 100
    const lowRisk = { region: 'stable', water: 'excellent', insulation: 'excellent' }; // 10 + 5 + 5 = 20
    const midRisk = { region: 'wildfire', water: 'medium', insulation: 'medium' }; // 30 + 15 + 15 = 60

    expect(calculateVulnerabilityScore(highRisk)).toBe(100);
    expect(calculateVulnerabilityScore(lowRisk)).toBe(20);
    expect(calculateVulnerabilityScore(midRisk)).toBe(60);
    expect(calculateVulnerabilityScore(null)).toBe(0);
  });
});
