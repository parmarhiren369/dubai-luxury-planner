# 📊 Excel Import Guide - Hotels

## Overview

The Excel import feature allows you to bulk import hotel data with all rates and pricing information. The system is flexible and accepts various column name formats.

## 📥 How to Import

1. Go to **Hotels** page
2. Click **Template** button to download a sample Excel file
3. Fill in your hotel data following the template
4. Click **Import** button
5. Select your Excel file (.xlsx or .xls)
6. Wait for confirmation message

## 📋 Required Columns

### Minimum Required
- **Hotel Name** (required) - Can be named: `Name`, `Hotel Name`, `Hotel`, `HotelName`, `hotel_name`

### Recommended Columns
- **Category** - Hotel star rating (e.g., "5 Star", "4 Star")
- **Location** - City or area (e.g., "Dubai", "Palm Jumeirah")

## 💰 Rate Columns

The system accepts flexible column names. Here are examples:

### Room Rates
| Accepted Column Names | Example Value |
|----------------------|---------------|
| `Single Room`, `Single`, `SGL`, `1BR`, `1 BR` | 1000 |
| `Double Room`, `Double`, `DBL`, `2BR`, `2 BR`, `Twin` | 1500 |
| `Triple Room`, `Triple`, `TPL`, `3BR`, `3 BR` | 2000 |
| `Quad Room`, `Quad`, `Quadruple`, `4BR`, `4 BR` | 2500 |
| `Six Room`, `6BR`, `6 BR` | 3000 |

### Extra Charges
| Accepted Column Names | Example Value |
|----------------------|---------------|
| `Extra Bed`, `Extra Bed > 11YRS`, `Ex. Bed > 11YRS`, `EX BED` | 200 |
| `Child With Bed`, `CWB`, `CWB [3-11 YRS]`, `Child w/ Bed` | 150 |
| `Child Without Bed`, `CNB`, `Child w/o Bed` | 100 |
| `CNB 3-5`, `CNB [3-5 YRS]`, `Child No Bed 3-5` | 80 |
| `CNB 5-11`, `CNB [5-11 YRS]`, `Child No Bed 5-11` | 100 |
| `Infant`, `Infant Rate`, `Baby` | 0 |

### Meal Plan
| Accepted Values | Description |
|----------------|-------------|
| `RO`, `Room Only` | Room Only |
| `BB`, `Bed & Breakfast`, `Breakfast` | Bed & Breakfast |
| `HB`, `Half Board` | Half Board |
| `FB`, `Full Board` | Full Board |
| `AI`, `All Inclusive` | All Inclusive |

### Status
- `active` (default)
- `inactive`

## 📝 Excel Format Example

| Name | Category | Location | Single Room | Double Room | Triple Room | Quad Room | Extra Bed | Child With Bed | Meal Plan | Status |
|------|----------|----------|-------------|--------------|-------------|-----------|-----------|----------------|-----------|--------|
| Atlantis The Palm | 5 Star Deluxe | Palm Jumeirah | 1654 | 2021 | 2572 | 3123 | 276 | 184 | BB | active |
| Burj Al Arab | 7 Star | Jumeirah | 4409 | 5512 | 7348 | 9184 | 735 | 551 | HB | active |

## ✅ Tips for Success

1. **Download Template First**: Use the "Template" button to get the exact format
2. **Column Names are Flexible**: The system recognizes variations (case-insensitive, with/without spaces)
3. **Numbers Only**: Rate fields should contain numbers only (no currency symbols)
4. **Required Field**: Hotel Name is mandatory - rows without names will be skipped
5. **Meal Plan Default**: If not specified, defaults to "BB" (Bed & Breakfast)
6. **Status Default**: If not specified, defaults to "active"

## 🔍 What Gets Imported

- ✅ Hotel name, category, location
- ✅ All room rates (Single, Double, Triple, Quad, Six)
- ✅ All extra charges (Extra Bed, Children rates, Infant)
- ✅ Meal plan
- ✅ Status (active/inactive)

## ⚠️ Common Issues

**"No valid hotel data found"**
- Make sure your Excel file has a column named "Name" or "Hotel Name"
- Check that at least one row has a hotel name filled in

**"Failed to import file"**
- Ensure file is .xlsx or .xls format
- Check that all required columns are present
- Verify data types (numbers for rates, text for names)

**"Some hotels already exist"**
- The system prevents duplicate hotels
- Update existing hotels instead of re-importing

## 🎯 Best Practices

1. **Use the Template**: Always start with the downloaded template
2. **Validate Data**: Check your Excel file before importing
3. **Test with Few Rows**: Import a small batch first to verify format
4. **Backup First**: Export existing data before bulk importing
5. **Check Results**: Review imported hotels to ensure accuracy

## 📞 Need Help?

If you encounter issues:
1. Check the error message for specific details
2. Verify your Excel file matches the template format
3. Ensure all required fields are filled
4. Try importing a smaller batch first
