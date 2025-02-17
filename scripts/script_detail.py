import json
import csv
import re
from pathlib import Path

def sanitize_key(key):
    # Remove special characters and replace with underscore
    key = re.sub(r'[%/()]', '_', key)
    # Remove multiple underscores
    key = re.sub(r'_+', '_', key)
    # Remove trailing underscores
    key = key.strip('_')
    key = key.replace('-', '$')
    return key

def process_value(value, unit):
    clean_value = value.replace('(', '').replace(')', '')
    if clean_value == '-':
        return "-"
    elif clean_value == 'Tr':
        return "Tr"
    elif clean_value == '':
        return "-"
    else:
        return f"{clean_value} {unit}".strip()

def update_food_data(csv_path):
    # JSONファイルの読み込み
    json_path = Path(__file__).parent.parent / "food_data.json"
    with open(json_path, 'r', encoding='utf-8') as f:
        food_data = json.load(f)
    
    # CSVファイルの読み込み
    with open(csv_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    # 単位行の処理
    raw_units = lines[1].strip().split(',')
    units = [unit.replace('/100 g', '').strip() for unit in raw_units]
    # print(units)
    # キー行の処理
    keys = lines[0].strip().split(',')
    # print(keys)
    
    # キーと単位のマッピング作成
    key_unit_map = {}
    for i in range (len(keys)):
        # print(keys[i])
        sanitized = sanitize_key(keys[i])
        unit = units[i] if i < len(units) else ''
        key_unit_map[sanitized] = unit
    print(key_unit_map)
    # 食品データの更新
    updated_ids = set()
    for line in lines[2:]:  # 3行目以降がデータ
        if not line.strip():
            continue
        values = line.strip().split(',')
        food_id = values[1]
        
        if food_id in food_data:
            food_item = food_data[food_id]
            updated_ids.add(food_id)
            
            # 各値の更新
            for i, value in enumerate(values):
                if i <= 4:  # nameまでの列はスキップ
                    continue
                original_key = keys[i]
                sanitized_key = sanitize_key(original_key)
                if sanitized_key not in food_item:  # 既存のプロパティは更新しない
                    unit = key_unit_map.get(sanitized_key, '')
                    processed_value = process_value(value, unit)
                    food_item[sanitized_key] = processed_value
    
    # 未更新のFoodItemに欠損値を設定
    for food_id, food_item in food_data.items():
        if food_id not in updated_ids:
            for i, key in enumerate(keys):
                if i <= 4:  # nameまでの列はスキップ
                    continue
                sanitized_key = sanitize_key(key)
                if sanitized_key not in food_item:
                    food_item[sanitized_key] = "-"
    
    # 新しいJSONファイルに保存
    output_path = Path(__file__).parent.parent / "food_data_new.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(food_data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    csv_path = r"C:\Users\nezow\OneDrive - Kyoto University\ドキュメント\hyakumi\csv\20230428-mxt_kagsei-mext_00001_044.csv"
    update_food_data(csv_path)
