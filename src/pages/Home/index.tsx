import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  //Percorre a array CART e retorna um novo objeto contendo o ID do produto e a quantidade
  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    //cria um novo objeto
    const newSumAmount = {...sumAmount}; 
    //cria uma nova propriedade no objeto com o id do product
    //seta a quantidade do product na nova propriedade do objeto
    newSumAmount[product.id] = product.amount;  
    //write: object {product.Id: product.amount}
    //expected: {1: 1}
    return newSumAmount
  }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      const response = await api.get<Product[]>('products')
      //Map para que os preços sejam formatados
      const data = response.data.map(product => ({
        ...product,
        priceFormatted: formatPrice(product.price)
      }))
      setProducts(data)
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id)
  }

  return (
    <ProductList>
      {
        products && products.map(product => <li key={product.id}>
          <img src={product.image} alt={product.title} />
          <strong>{product.title}</strong>
          <span>{product.priceFormatted}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(product.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[product.id] || 0}
            </div>
  
            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>)
      }
      
    </ProductList>
  );
};

export default Home;
