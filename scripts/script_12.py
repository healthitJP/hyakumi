# /C:/Users/nezow/OneDrive - Kyoto University/ドキュメント/hyakumi/generate_ts_types.py

import csv
import re
import json

def sanitize_key(key):
    # Remove special characters and replace with underscore
    key = re.sub(r'[%/()]', '_', key)
    # Remove multiple underscores
    key = re.sub(r'_+', '_', key)
    # Remove trailing underscores
    key = key.strip('_')
    if key.endswith('-'):
        key = key[:-1] + '$'
    return key

def generate_ts_file(input_csv_path, output_ts_path):
    with open(input_csv_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    # First line contains units
    units = lines[0].strip().split(',')
    # Second line contains keys
    keys = lines[1].strip().split(',')
    
    # マッピングの用意
    key_unit_map = {}
    for i in range(len(keys)):
        sanitized = sanitize_key(keys[i])
        unit = units[i] if i < len(units) else ''
        key_unit_map[sanitized] = unit
    
    # Create TypeScript interface
    ts_content = []
    ts_content.append('// 可食部100g当たり')
    ts_content.append('// Food item interface')
    ts_content.append('export interface FoodItem {')
    
    # Add basic fields
    ts_content.append('  category: string;')
    ts_content.append('  id: string;')
    ts_content.append('  index: string;')
    ts_content.append('  name: string;')
    
    # Process remaining fields
    for i, key in enumerate(keys[4:], 4):  # Skip first 4 columns
        sanitized_key = sanitize_key(key)
        unit = units[i] if i < len(units) else ''
        ts_content.append(f'  /** {unit} */')
        ts_content.append(f'  {sanitized_key}: string')
    
    ts_content.append('}')
    ts_content.append('')
    
    # Create data array
    ts_content.append('export const foodItems: FoodItem[] = [')
    
    # Process data rows
    for line in lines[2:]:
        if not line.strip():
            continue
        values = line.strip().split(',')
        obj = []
        for i, value in enumerate(values):
            sk = sanitize_key(keys[i]) if i < len(keys) else f'column{i}'
            clean_value = value.replace('(', '').replace(')', '')
            if clean_value == '-':
                obj.append(f'  {sk}: "-"')
            elif clean_value == 'Tr':
                obj.append(f'  {sk}: "Tr"')
            elif i < 4:  # First 4 columns are strings
                obj.append(f'  {sk}: "{value}"')
            else:
                if clean_value == '':
                    obj.append(f'  {sk}: "-"')
                else:
                    mapped_unit = key_unit_map.get(sk, '')
                    mapped_val = (clean_value + ' ' + mapped_unit).strip()
                    obj.append(f'  {sk}: "{mapped_val}"')
        
        ts_content.append('  {')
        ts_content.append(',\n'.join(obj))
        ts_content.append('  },')
    
    ts_content.append('];')
    
    # Write to file
    with open(output_ts_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(ts_content))

def generate_json_file(input_csv_path, output_json_path):
    with open(input_csv_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    # First line contains units
    units = lines[0].strip().split(',')
    # Second line contains keys
    keys = lines[1].strip().split(',')
    
    # マッピングの用意
    key_unit_map = {}
    for i in range(len(keys)):
        sanitized = sanitize_key(keys[i])
        unit = units[i] if i < len(units) else ''
        key_unit_map[sanitized] = unit
    
    # Process data rows
    food_items = {}  # 配列からオブジェクトに変更
    for line in lines[2:]:
        if not line.strip():
            continue
        values = line.strip().split(',')
        obj = {}
        item_id = None  # ID を保持する変数
        
        for i, value in enumerate(values):
            sk = sanitize_key(keys[i]) if i < len(keys) else f'column{i}'
            
            # ID フィールドを特別に処理
            if sk == 'id':
                item_id = value
                obj[sk] = value
                continue
                
            if value == '-':
                obj[sk] = "-"
            elif value == 'Tr':
                obj[sk] = "Tr"
            elif i < 4:  # First 4 columns are strings
                obj[sk] = value
            else:
                clean_value = value.replace('(', '').replace(')', '')
                if clean_value == '':
                    obj[sk] = "-"
                else:
                    mapped_unit = key_unit_map.get(sk, '')
                    mapped_val = (clean_value + ' ' + mapped_unit).strip()
                    obj[sk] = mapped_val
        
        if item_id:  # item_id が存在する場合のみ追加
            food_items[item_id] = obj
    
    # Write to JSON file
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(food_items, f, ensure_ascii=False, indent=2)

# Usage example
input_path = r"C:\Users\nezow\OneDrive - Kyoto University\ドキュメント\hyakumi\csv\20230428-mxt_kagsei-mext_00001_012.csv"
output_ts_path = r"C:\Users\nezow\OneDrive - Kyoto University\ドキュメント\hyakumi\food_data.ts"
output_json_path = r"C:\Users\nezow\OneDrive - Kyoto University\ドキュメント\hyakumi\food_data.json"

generate_ts_file(input_path, output_ts_path)
generate_json_file(input_path, output_json_path)