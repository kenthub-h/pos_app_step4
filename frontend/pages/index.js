import { useState } from 'react';

export default function POS() {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [purchaseList, setPurchaseList] = useState([]);
    const [total, setTotal] = useState(0);

    const fetchProduct = async () => {
        const res = await fetch(`/api/product/${code}`);
        if (res.ok) {
            const product = await res.json();
            setName(product.name);
            setPrice(product.price);
        } else {
            setName('商品がマスタ未登録です');
            setPrice('');
        }
    };

    const addProduct = () => {
        setPurchaseList([...purchaseList, { code, name, price }]);
        setTotal(total + price);
        setCode('');
        setName('');
        setPrice('');
    };

    const completePurchase = async () => {
        const items = purchaseList.map(({ code, name, price }) => ({ code, name, price }));
        const res = await fetch('/api/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emp_cd: '9999999999', items })
        });

        if (res.ok) {
            const data = await res.json();
            alert(`合計金額: ${data.total_amount}円`);
            setPurchaseList([]);
            setTotal(0);
        }
    };

    return (
        <div>
            <h1>POSアプリ</h1>
            <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="商品コード"
            />
            <button onClick={fetchProduct}>読み込み</button>
            <div>名称: {name}</div>
            <div>価格: {price}</div>
            <button onClick={addProduct}>追加</button>
            <h2>購入リスト</h2>
            <ul>
                {purchaseList.map((item, index) => (
                    <li key={index}>{item.name} - {item.price}円</li>
                ))}
            </ul>
            <div>合計: {total}円</div>
            <button onClick={completePurchase}>購入</button>
        </div>
    );
}
