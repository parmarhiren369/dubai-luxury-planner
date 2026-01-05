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
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet); // Parse as any first

        // Normalize keys (trim spaces, lowercase mapping if needed)
        const normalizedData = jsonData.map((row) => {
          const newRow: any = {};
          Object.keys(row).forEach((key) => {
            const normalizedKey = key.trim(); // Only trim for now to match interface strictly but allow spaces
            newRow[normalizedKey] = row[key];
          });
          return newRow as T;
        });

        resolve(normalizedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
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
  return data
    .filter(row => Object.keys(row).length > 0)
    .map((row: any) => {
      // Helper to get value case-insensitively
      const getVal = (key: string) => {
        const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
        return foundKey ? row[foundKey] : undefined;
      };

      const name = getVal('name');
      if (!name) return null; // Skip invalid rows

      return {
        name: String(name),
        category: String(getVal('category') || ""),
        location: String(getVal('location') || ""),
        singleRoom: Number(getVal('singleRoom') || 0),
        doubleRoom: Number(getVal('doubleRoom') || 0),
        tripleRoom: Number(getVal('tripleRoom') || 0),
        quadRoom: Number(getVal('quadRoom') || 0),
        sixRoom: Number(getVal('sixRoom') || 0),
        extraBed: Number(getVal('extraBed') || 0),
        childWithBed: Number(getVal('childWithBed') || 0),
        childWithoutBed: Number(getVal('childWithoutBed') || 0),
        childWithoutBed3to5: Number(getVal('childWithoutBed3to5') || 0),
        childWithoutBed5to11: Number(getVal('childWithoutBed5to11') || 0),
        infant: Number(getVal('infant') || 0),
        mealPlan: String(getVal('mealPlan') || "BB"),
        status: getVal('status') === "inactive" ? "inactive" : "active",
      };
    })
    .filter((hotel): hotel is Omit<Hotel, "id"> => hotel !== null);
}
