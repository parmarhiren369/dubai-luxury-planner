import * as XLSX from "xlsx";

export interface Hotel {
  id: string;
  name: string;
  category: string;
  location: string;
  singleRoom: number;
  doubleRoom: number;
  tripleRoom: number;
  quadRoom: number;
  sixRoom: number;
  extraBed: number;
  childWithBed: number;
  childWithoutBed: number;
  childWithoutBed3to5: number;
  childWithoutBed5to11: number;
  infant: number;
  mealPlan: string;
  status: "active" | "inactive";
}

export interface Sightseeing {
  id: string;
  name: string;
  description: string;
  duration: string;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  entryTicket: number;
  category: string;
  includes: string;
  status: "active" | "inactive";
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  passportNo: string;
  address: string;
  createdAt: string;
  status: "active" | "inactive";
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  commission: number;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Meal {
  id: string;
  name: string;
  type: string;
  description: string;
  pricePerPerson: number;
  restaurant: string;
  status: "active" | "inactive";
}

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = "Sheet1"
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...data.map((row) => String(row[key]).length)) + 2,
  }));
  worksheet["!cols"] = colWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function parseExcelFile<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Use the first sheet or try to find a sheet with "Hotel" or "Hotels" in the name
        let sheetName = workbook.SheetNames[0];
        const hotelSheet = workbook.SheetNames.find(name => 
          name.toLowerCase().includes('hotel') || 
          name.toLowerCase().includes('data') ||
          name.toLowerCase().includes('import')
        );
        if (hotelSheet) {
          sheetName = hotelSheet;
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        // Normalize keys - create a mapping of normalized keys to original keys
        const normalizedData = jsonData.map((row) => {
          const newRow: any = {};
          Object.keys(row).forEach((key) => {
            const normalizedKey = key.trim();
            newRow[normalizedKey] = row[key];
          });
          return newRow as T;
        });

        console.log(`Parsed ${normalizedData.length} rows from Excel sheet "${sheetName}"`);
        console.log("Available columns:", Object.keys(normalizedData[0] || {}));
        
        resolve(normalizedData);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        reject(new Error("Failed to parse Excel file. Please ensure it's a valid .xlsx or .xls file."));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file. Please check the file is not corrupted."));
    reader.readAsArrayBuffer(file);
  });
}

export function downloadTemplate<T extends Record<string, any>>(
  template: T,
  filename: string
) {
  const worksheet = XLSX.utils.json_to_sheet([template]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  XLSX.writeFile(workbook, `${filename}_template.xlsx`);
}

export function transformHotelImportData(data: any[]): Omit<Hotel, "id">[] {
  if (!data || data.length === 0) {
    console.warn("No data provided to transform");
    return [];
  }

  console.log(`Transforming ${data.length} rows...`);

  // Get all available column names for debugging
  const availableColumns = Object.keys(data[0] || {});
  console.log("Available columns:", availableColumns);

  return data
    .filter((row, index) => {
      // Skip empty rows
      if (!row || Object.keys(row).length === 0) {
        console.log(`Row ${index + 2}: Skipping empty row`);
        return false;
      }
      return true;
    })
    .map((row: any, index: number) => {
      // Helper to get value case-insensitively with multiple possible keys
      const getVal = (possibleKeys: string[]): any => {
        for (const key of possibleKeys) {
          const foundKey = Object.keys(row).find(k => {
            const normalizedK = k.trim().toLowerCase().replace(/\s+/g, '');
            const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '');
            return normalizedK === normalizedKey || normalizedK.includes(normalizedKey) || normalizedKey.includes(normalizedK);
          });
          if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && row[foundKey] !== '') {
            return row[foundKey];
          }
        }
        return undefined;
      };

      // Try multiple possible column name variations for hotel name
      const name = getVal([
        'name', 'hotel name', 'hotel', 'hotelname', 'hotel_name',
        'hotel_name', 'property name', 'property', 'accommodation'
      ]);
      
      if (!name || String(name).trim() === '') {
        console.warn(`Row ${index + 2}: Skipping - no hotel name found`);
        return null; // Skip invalid rows
      }

      // Helper to parse number safely
      const parseNumber = (val: any, defaultValue: number = 0): number => {
        if (val === undefined || val === null || val === '') return defaultValue;
        const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d.-]/g, '')) : Number(val);
        return isNaN(num) ? defaultValue : num;
      };

      // Helper to parse string safely
      const parseString = (val: any, defaultValue: string = ''): string => {
        if (val === undefined || val === null) return defaultValue;
        return String(val).trim();
      };

      const hotel: Omit<Hotel, "id"> = {
        name: parseString(name),
        category: parseString(getVal([
          'category', 'star', 'star rating', 'rating', 'hotel category', 
          'category/star', 'classification', 'type'
        ]), ''),
        location: parseString(getVal([
          'location', 'city', 'area', 'address', 'place', 'destination', 'region'
        ]), ''),
        
        // Room rates - try multiple column name variations
        singleRoom: parseNumber(getVal([
          'singleroom', 'single room', 'single', 'sgl', '1br', '1 br', 
          'single room rate', 'sgl rate', 'single rate', '1 bed room'
        ])),
        doubleRoom: parseNumber(getVal([
          'doubleroom', 'double room', 'double', 'dbl', '2br', '2 br', 
          'double room rate', 'dbl rate', 'double rate', 'twin', 'twin room', '2 bed room'
        ])),
        tripleRoom: parseNumber(getVal([
          'tripleroom', 'triple room', 'triple', 'tpl', '3br', '3 br', 
          'triple room rate', 'tpl rate', 'triple rate', '3 bed room'
        ])),
        quadRoom: parseNumber(getVal([
          'quadroom', 'quad room', 'quad', 'quadruple', '4br', '4 br', 
          'quad room rate', 'quad rate', 'quadruple rate', '4 bed room'
        ])),
        sixRoom: parseNumber(getVal([
          'sixroom', 'six room', '6br', '6 br', 'six room rate', 
          'six rate', '6 bed room'
        ]), 0),
        
        // Extra charges
        extraBed: parseNumber(getVal([
          'extrabed', 'extra bed', 'extra bed > 11yrs', 'ex. bed > 11yrs', 
          'extra bed rate', 'ex bed', 'extra bed charge', 'extra bed price'
        ])),
        childWithBed: parseNumber(getVal([
          'childwithbed', 'child with bed', 'cwb', 'cwb [3-11 yrs]', 
          'child w/ bed', 'child with bed rate', 'child with bed charge'
        ])),
        childWithoutBed: parseNumber(getVal([
          'childwithoutbed', 'child without bed', 'cnb', 'child w/o bed', 
          'child without bed rate', 'child without bed charge'
        ])),
        childWithoutBed3to5: parseNumber(getVal([
          'cnb 3-5', 'cnb [3-5 yrs]', 'child no bed 3-5', 
          'child without bed 3-5', 'cnb 3-5 yrs', 'child without bed 3 to 5'
        ]), 0),
        childWithoutBed5to11: parseNumber(getVal([
          'cnb 5-11', 'cnb [5-11 yrs]', 'child no bed 5-11', 
          'child without bed 5-11', 'cnb 5-11 yrs', 'child without bed 5 to 11'
        ]), 0),
        infant: parseNumber(getVal([
          'infant', 'infant rate', 'baby', 'infant price', 'infant charge'
        ]), 0),
        
        // Meal plan and status
        mealPlan: parseString(getVal([
          'mealplan', 'meal plan', 'meal', 'board', 'board basis', 
          'boardbasis', 'breakfast', 'meal basis'
        ]), 'BB').toUpperCase(),
        status: getVal(['status', 'active', 'inactive']) === "inactive" ? "inactive" : "active",
      };

      // Validate meal plan
      const validMealPlans = ['RO', 'BB', 'HB', 'FB', 'AI', 'ROOM ONLY', 'BED & BREAKFAST', 'HALF BOARD', 'FULL BOARD', 'ALL INCLUSIVE'];
      const mealPlanUpper = hotel.mealPlan.toUpperCase();
      if (!validMealPlans.some(vp => mealPlanUpper.includes(vp))) {
        hotel.mealPlan = 'BB'; // Default to BB if invalid
      } else {
        // Normalize meal plan codes
        if (mealPlanUpper.includes('ROOM ONLY') || mealPlanUpper.includes('RO')) hotel.mealPlan = 'RO';
        else if (mealPlanUpper.includes('BED & BREAKFAST') || mealPlanUpper.includes('BREAKFAST') || mealPlanUpper.includes('BB')) hotel.mealPlan = 'BB';
        else if (mealPlanUpper.includes('HALF BOARD') || mealPlanUpper.includes('HB')) hotel.mealPlan = 'HB';
        else if (mealPlanUpper.includes('FULL BOARD') || mealPlanUpper.includes('FB')) hotel.mealPlan = 'FB';
        else if (mealPlanUpper.includes('ALL INCLUSIVE') || mealPlanUpper.includes('AI')) hotel.mealPlan = 'AI';
      }

      console.log(`Row ${index + 2}: Parsed hotel "${hotel.name}" - Single: ${hotel.singleRoom}, Double: ${hotel.doubleRoom}`);
      
      return hotel;
    })
    .filter((hotel): hotel is Omit<Hotel, "id"> => hotel !== null);
}
