from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import mysql.connector

app = FastAPI()

# CORS設定を追加
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 必要に応じてNext.jsのURLに制限できます（例: ["http://localhost:3000"]）
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL接続設定
db_config = {
    'user': 'root',
    'password': 'password',  # MySQLのパスワードに合わせて変更
    'host': 'localhost',
    'database': 'pos_app'
}

# 商品情報を格納するモデル
class Product(BaseModel):
    code: str
    name: str
    price: int

# 購入情報を格納するモデル
class Purchase(BaseModel):
    emp_cd: str
    items: List[Product]

# 商品マスタ検索API
@app.get("/product/{code}")
def get_product(code: str):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    
    # デバッグ用のprint文を追加
    print(f"Looking for product with code: {code}")
    
    # TRIMを使用して余分なスペースを削除して検索
    cursor.execute("SELECT * FROM product_master WHERE TRIM(code) = %s", (code,))
    product = cursor.fetchone()
    
    # デバッグ用のprint文を追加
    print(f"Query result: {product}")
    
    conn.close()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product



# 購入API
@app.post("/purchase")
def purchase(purchase: Purchase):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    # 取引テーブルに新しい行を挿入
    cursor.execute(
        "INSERT INTO transaction (emp_cd) VALUES (%s)", 
        (purchase.emp_cd,)
    )
    trd_id = cursor.lastrowid
    
    # 取引詳細に商品の情報を追加
    total_amount = 0
    for item in purchase.items:
        cursor.execute(
            "SELECT prd_id, price FROM product_master WHERE code = %s", 
            (item.code,)
        )
        product = cursor.fetchone()
        if not product:
            conn.rollback()
            conn.close()
            raise HTTPException(status_code=404, detail=f"Product with code {item.code} not found")
        
        prd_id, price = product
        cursor.execute(
            "INSERT INTO transaction_detail (trd_id, prd_id, prd_code, prd_name, prd_price) VALUES (%s, %s, %s, %s, %s)",
            (trd_id, prd_id, item.code, item.name, price)
        )
        total_amount += price
    
    # 合計金額を更新
    cursor.execute(
        "UPDATE transaction SET total_amt = %s WHERE trd_id = %s",
        (total_amount, trd_id)
    )
    conn.commit()
    conn.close()
    
    return {"transaction_id": trd_id, "total_amount": total_amount}
