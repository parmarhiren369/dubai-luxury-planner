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
  extraBed: number;
  childWithBed: number;
  childWithoutBed: number;
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
        const jsonData = XLSX.utils.sheet_to_json<T>(worksheet);
        resolve(jsonData);
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
