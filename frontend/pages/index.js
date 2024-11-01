import { useState } from 'react';

export default function POS() {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [purchaseList, setPurchaseList] = useState([]);
    const [total, setTotal] = useState(0);
    const [showPopup, setShowPopup] = useState(false); // ポップアップ表示状態
    const [finalTotal, setFinalTotal] = useState(0); // 合計金額

    const fetchProduct = async () => {
        const trimmedCode = code.trim();
        try {
            const res = await fetch(`http://localhost:8000/product/${trimmedCode}`);
            if (res.ok) {
                const product = await res.json();
                setName(product.name);
                setPrice(product.price);
            } else {
                setName('商品がマスタ未登録です');
                setPrice('');
            }
        } catch (error) {
            console.error('Fetch error:', error);
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
        const res = await fetch('http://localhost:8000/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emp_cd: '9999999999', items })
        });
    
        if (res.ok) {
            const data = await res.json();
            setFinalTotal(data.total_amount); // 合計金額を保存
            setShowPopup(true); // ポップアップを表示
        }
    };

    // OKボタンが押された時の処理
    const handlePopupClose = () => {
        setShowPopup(false); // ポップアップを閉じる
        setCode(''); // コード入力欄をリセット
        setName(''); // 名称表示エリアをリセット
        setPrice(''); // 単価表示エリアをリセット
        setPurchaseList([]); // 購入リストをクリア
        setTotal(0); // 合計金額をリセット
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>POSアプリ</h1>
            <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="商品コードを入力"
                style={styles.input}
            />
            <button style={styles.button} onClick={fetchProduct}>商品を読み込む</button>
            <div style={styles.productInfo}>
                <div><strong>名称:</strong> {name}</div>
                <div><strong>価格:</strong> {price ? `${price}円` : ''}</div>
            </div>
            <button style={styles.button} onClick={addProduct}>リストに追加</button>
            <h2 style={styles.subtitle}>購入リスト</h2>
            <ul style={styles.list}>
                {purchaseList.map((item, index) => (
                    <li key={index} style={styles.listItem}>
                        {item.name} - {item.price}円
                    </li>
                ))}
            </ul>
            <div style={styles.total}><strong>合計:</strong> {total}円</div>
            <button style={styles.completeButton} onClick={completePurchase}>購入を完了する</button>

            {/* ポップアップウィンドウ */}
            {showPopup && (
                <div style={styles.popup}>
                    <div style={styles.popupContent}>
                        <h2>購入完了</h2>
                        <p>合計金額（税込）: {finalTotal}円</p>
                        <button style={styles.button} onClick={handlePopupClose}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '400px',
        margin: '0 auto',
        padding: '10px',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box', // 全体のサイズ調整
    },
    title: {
        color: '#003366',
        textAlign: 'center',
        marginBottom: '15px',
        fontSize: '20px',
    },
    input: {
        width: '100%',
        padding: '8px',
        marginBottom: '10px',
        borderRadius: '4px',
        border: '1px solid #003366',
        outline: 'none',
        fontSize: '16px',
        boxSizing: 'border-box', // パディングを含めたサイズ調整
    },
    button: {
        backgroundColor: '#007BFF',
        color: '#fff',
        padding: '10px 0',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
        marginBottom: '10px',
        transition: 'background-color 0.3s',
        fontSize: '16px',
        boxSizing: 'border-box',
    },
    completeButton: {
        backgroundColor: '#0056b3',
        color: '#fff',
        padding: '10px 0',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
        transition: 'background-color 0.3s',
        fontSize: '16px',
        boxSizing: 'border-box',
    },
    productInfo: {
        backgroundColor: '#e0f0ff',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '10px',
        fontSize: '14px',
        boxSizing: 'border-box',
    },
    subtitle: {
        color: '#003366',
        marginBottom: '10px',
        fontSize: '18px',
    },
    list: {
        listStyleType: 'none',
        padding: '0',
        marginBottom: '10px',
    },
    listItem: {
        backgroundColor: '#e6f2ff',
        padding: '8px',
        marginBottom: '5px',
        borderRadius: '4px',
        fontSize: '14px',
    },
    total: {
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'right',
        marginBottom: '10px',
        color: '#003366',
    },
    popup: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupContent: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
    },
};
