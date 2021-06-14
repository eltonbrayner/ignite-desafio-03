import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      //Novo array com os valores de cart
      const updatedCart = [...cart];
      //Verifico se o produto já existe no carrinho através do metodo FIND 
      //Caso exista ele retorna o elemento encontrado e se não existir retorna undefined
      const productExists = updatedCart.find(product => product.id === productId);

      const stock = await api.get(`stock/${productId}`) //retorna o estoque do produto (id e amount) da loja
      const stockAmount = stock.data.amount; //estoque disponivel na loja

      //Caso já exista no carrinho retorna a quantidade que está no carrinho 
      const currentAmount = productExists ? productExists.amount : 0;
      const amount = currentAmount + 1; //quantidade desejada do cliente (intuito de verificar se passou do limite)

      if(amount > stockAmount){
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      if(productExists){
        productExists.amount = amount;
      }else {
        const product = await api.get(`/products/${productId}`)

        //É necessario adicionar mais uma propriedade ao objeto porque o PRODUCT faz referencia lista de produtos
        //E essa lista não tem a quantidade. No carrinho é preciso, além das caracteristicas da lista, a quantidade
        const newProduct = {
          ...product.data,
          amount: 1
        }
        updatedCart.push(newProduct);
      }

      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart]
      //Find index para verificar qual é o index do product na Array e poder utilizar o slice para remover
      const productIndex = updatedCart.findIndex(product => product.id === productId)

      //Caso o findIndex não encontre ele retorna -1
      //Caso encontre retorna o indice do array (que inicia em zero)
      if(productIndex >= 0){
        updatedCart.splice(productIndex, 1) //começando do indice encontrado e elementos a ser apagados
        setCart(updatedCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      }else {
        throw Error(); //forçar a cair no catch
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
