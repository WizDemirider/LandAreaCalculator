import React, { useState, useEffect } from 'react';
import { Calculator, RefreshCw, Settings, X } from 'lucide-react';

const LandAreaCalculator = () => {
  const [area, setArea] = useState('');
  const [unit, setUnit] = useState('sqft');
  const [price, setPrice] = useState('');
  const [isTotalPrice, setIsTotalPrice] = useState(true);
  const [numberSystem, setNumberSystem] = useState('indian'); // 'indian' or 'international'
  const [precision, setPrecision] = useState(2);
  const [showSettings, setShowSettings] = useState(false);
  const [results, setResults] = useState([]);

  // Conversion factors to square feet
  const conversionFactors = {
    sqft: 1,
    sqyd: 9,
    sqm: 10.764,
    vaar: 9, // 1 vaar = 9 sq ft (Gujarat/Rajasthan)
    guntha: 1089, // 1 guntha = 1089 sq ft (Maharashtra)
    pench: 484, // 1 pench = 484 sq ft (Gujarat)
    bigha: 27225, // 1 bigha = 27225 sq ft (standard, varies by region)
    acre: 43560,
    hectare: 107639.1,
    katha: 720, // 1 katha = 720 sq ft (Bengal/Bihar)
    cent: 435.6, // 1 cent = 435.6 sq ft (South India)
    dismil: 435.6, // 1 dismil = 435.6 sq ft (same as cent)
    marla: 272.25, // 1 marla = 272.25 sq ft (Punjab/Pakistan)
    kanal: 5445 // 1 kanal = 5445 sq ft (Kashmir/Punjab)
  };

  const unitNames = {
    sqft: 'Square Feet',
    sqyd: 'Square Yards', 
    sqm: 'Square Meters',
    vaar: 'Vaar',
    guntha: 'Guntha',
    pench: 'Pench',
    bigha: 'Bigha',
    acre: 'Acre',
    hectare: 'Hectare',
    katha: 'Katha',
    cent: 'Cent',
    dismil: 'Dismil',
    marla: 'Marla',
    kanal: 'Kanal'
  };

  const calculateResults = () => {
    if (!area || isNaN(parseFloat(area))) {
      setResults([]);
      return;
    }

    const areaValue = parseFloat(area);
    const priceValue = price ? parseFloat(price) : 0;
    const areaInSqFt = areaValue * conversionFactors[unit];
    
    // Calculate price per square foot based on whether it's total price or price per unit
    let pricePerSqFt;
    if (isTotalPrice) {
      // If it's total price, divide by the area in the selected unit to get price per unit, 
      // then convert to price per sqft
      pricePerSqFt = priceValue / areaInSqFt;
    } else {
      // If it's price per unit, convert directly to price per sqft
      pricePerSqFt = priceValue / conversionFactors[unit];
    }
    
    const calculatedResults = Object.keys(conversionFactors).map(currentUnit => {
      const convertedArea = areaInSqFt / conversionFactors[currentUnit];
      const pricePerUnit = pricePerSqFt * conversionFactors[currentUnit];
      
      return {
        unit: currentUnit,
        unitName: unitNames[currentUnit],
        area: convertedArea,
        pricePerUnit: priceValue ? pricePerUnit : null,
        isOriginal: currentUnit === unit
      };
    });

    // Sort by area descending
    calculatedResults.sort((a, b) => b.area - a.area);
    setResults(calculatedResults);
  };

  useEffect(() => {
    calculateResults();
  }, [area, unit, price, isTotalPrice, numberSystem, precision]);

  const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    const value = parseFloat(num);
    
    if (value < 0.001) return value.toExponential(3);
    
    // Format based on number system
    if (numberSystem === 'indian') {
      // Indian number system (Lakh, Crore)
      if (value >= 10000000) { // 1 Crore
        const crores = (value / 10000000).toFixed(precision);
        return formatWithCommas(crores, 'indian') + ' Cr';
      } else if (value >= 100000) { // 1 Lakh
        const lakhs = (value / 100000).toFixed(precision);
        return formatWithCommas(lakhs, 'indian') + ' L';
      } else if (value >= 1000) {
        const thousands = (value / 1000).toFixed(precision);
        return formatWithCommas(thousands, 'indian') + ' K';
      } else {
        return formatWithCommas(value.toFixed(precision), 'indian');
      }
    } else {
      // International number system (K, M, B)
      if (value >= 1000000000) { // 1 Billion
        const billions = (value / 1000000000).toFixed(precision);
        return formatWithCommas(billions, 'international') + 'B';
      } else if (value >= 1000000) { // 1 Million
        const millions = (value / 1000000).toFixed(precision);
        return formatWithCommas(millions, 'international') + 'M';
      } else if (value >= 1000) { // 1 Thousand
        const thousands = (value / 1000).toFixed(precision);
        return formatWithCommas(thousands, 'international') + 'K';
      } else {
        return formatWithCommas(value.toFixed(precision), 'international');
      }
    }
  };

  const formatWithCommas = (numStr, system) => {
    const parts = numStr.toString().split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] ? '.' + parts[1] : '';
    
    let formattedInteger;
    if (system === 'indian') {
      // Indian comma system: 12,34,567 (first comma after 3 digits from right, then every 2 digits)
      if (integerPart.length <= 3) {
        formattedInteger = integerPart;
      } else {
        const lastThree = integerPart.slice(-3);
        const remaining = integerPart.slice(0, -3);
        const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
        formattedInteger = formattedRemaining + ',' + lastThree;
      }
    } else {
      // International comma system: 1,234,567
      formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    // Remove trailing zeros from decimal part
    const cleanDecimal = decimalPart.replace(/\.?0+$/, '');
    return formattedInteger + cleanDecimal;
  };

  const formatInputNumber = (value) => {
    if (!value || value === '') return '';
    const numValue = parseFloat(value.toString().replace(/,/g, ''));
    if (isNaN(numValue)) return value;
    return formatWithCommas(numValue.toString(), numberSystem);
  };

  const parseInputNumber = (value) => {
    if (!value) return '';
    return value.toString().replace(/,/g, '');
  };

  const clearAll = () => {
    setArea('');
    setPrice('');
    setResults([]);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">Land Area Calculator</h1>
                <p className="text-blue-100 mt-1">Convert between units and calculate rates</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Input Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area Value</label>
              <input
                type="text"
                value={formatInputNumber(area)}
                onChange={(e) => setArea(parseInputNumber(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="Enter area"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(unitNames).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (Optional)</label>
              <input
                type="text"
                value={formatInputNumber(price)}
                onChange={(e) => setPrice(parseInputNumber(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder={isTotalPrice ? "Enter total price" : "Enter price per unit"}
              />
              <div className="mt-2">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isTotalPrice}
                    onChange={(e) => setIsTotalPrice(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  This is total price (uncheck if price per unit)
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Clear All
            </button>
          </div>

          {/* Results Table */}
          {results.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Area
                      </th>
                      {price && (
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Price per Unit
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr 
                        key={result.unit} 
                        className={`${result.isOriginal ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`font-medium ${result.isOriginal ? 'text-blue-800' : 'text-gray-900'}`}>
                              {result.unitName}
                            </span>
                            {result.isOriginal && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Original
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-right font-mono text-lg ${result.isOriginal ? 'text-blue-800 font-bold' : 'text-gray-900'}`}>
                          {formatNumber(result.area)}
                        </td>
                        {price && (
                          <td className={`px-6 py-4 text-right font-mono text-lg ${result.isOriginal ? 'text-blue-800 font-bold' : 'text-gray-900'}`}>
                            ₹{formatNumber(result.pricePerUnit)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Unit Reference */}
          <div className="mt-8 bg-yellow-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">Unit Reference</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <strong className="text-yellow-700">International:</strong>
                <div>• Square Feet, Yards, Meters</div>
                <div>• Acre, Hectare</div>
              </div>
              <div>
                <strong className="text-yellow-700">Western India:</strong>
                <div>• Vaar (Gujarat/Rajasthan)</div>
                <div>• Guntha (Maharashtra)</div>
                <div>• Pench (Gujarat)</div>
              </div>
              <div>
                <strong className="text-yellow-700">Other Regions:</strong>
                <div>• Bigha, Katha (North/East)</div>
                <div>• Cent/Dismil (South)</div>
                <div>• Marla, Kanal (Punjab)</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-yellow-700">
              Note: Some units may vary by region. These are standard conversions.
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Number System</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="numberSystem"
                        value="indian"
                        checked={numberSystem === 'indian'}
                        onChange={(e) => setNumberSystem(e.target.value)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium">Indian System</div>
                        <div className="text-sm text-gray-500">Lakh, Crore (12,34,567)</div>
                      </div>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="numberSystem"
                        value="international"
                        checked={numberSystem === 'international'}
                        onChange={(e) => setNumberSystem(e.target.value)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium">International System</div>
                        <div className="text-sm text-gray-500">K, M, B (1,234,567)</div>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Decimal Precision</label>
                  <select
                    value={precision}
                    onChange={(e) => setPrecision(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="0">0 decimals</option>
                    <option value="1">1 decimal</option>
                    <option value="2">2 decimals</option>
                    <option value="3">3 decimals</option>
                    <option value="4">4 decimals</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandAreaCalculator;