import "./App.css";
import Home from "./components/home";
import { Products } from "./components/Products";
import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import marketplace from "./contracts/marketplace.abi.json";
import IERC from "./contracts/IERC.abi.json";
import BigNumber from "bignumber.js";

const ERC20_DECIMALS = 18;
const contractAddress = "0x86B54C4b5c8a6f2e65bd3A5c3157990B5cD1e18c";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

function App() {
  const [contract, setcontract] = useState(null);
  const [address, setAddress] = useState(null);
  const [kit, setKit] = useState(null);
  const [cUSDBalance, setcUSDBalance] = useState(0);
  const [products, setProducts] = useState([]);

  const connectToWallet = async () => {
    if (window.celo) {
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        let kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        const user_address = accounts[0];
        kit.defaultAccount = user_address;

        await setAddress(user_address);
        await setKit(kit);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Error Occurred");
    }
  };

  const getBalance = useCallback(async () => {
    try {
      const balance = await kit.getTotalBalance(address);
      const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);

      const contract = new kit.web3.eth.Contract(marketplace, contractAddress);
      setcontract(contract);
      setcUSDBalance(USDBalance);
    } catch (error) {
      console.log(error);
    }
  }, [address, kit]);

  const getProducts = useCallback(async () => {
    const productsLength = await contract.methods.getProductsLength().call();
    const products = [];
    for (let index = 0; index < productsLength; index++) {
      let _products = new Promise(async (resolve, reject) => {
        let product = await contract.methods.readProduct(index).call();

        resolve({
          index: index,
          owner: product[0],
          name: product[1],
          image: product[2],
          description: product[3],
          location: product[4],
          price: product[5],
          sold: product[6],
        });
      });
      products.push(_products);
    }

    const _products = await Promise.all(products);
    setProducts(_products);
  }, [contract]);

  const addProduct = async (_name, _image, _description, _location, _price, _sold) => {
    let price = new BigNumber(_price).shiftedBy(ERC20_DECIMALS).toString();
    try {
      await contract.methods
        .writeProduct(_name, _image, _description, _location, price)
        .send({ from: address });
      getProducts();
    } catch (error) {
      alert(error);
    }
  };

  const buyProduct = async (_index) => {
    try {
      const cUSDContract = new kit.web3.eth.Contract(IERC, cUSDContractAddress);
     
      console.log()
      await cUSDContract.methods
        .approve(contractAddress, products[_index].price)
        .send({ from: address });
      await contract.methods
        .buyProduct(_index)
        .send({ from: address });
      getProducts();
      getBalance();
      alert("you have successfully bought this product");
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    connectToWallet();
  }, []);

  useEffect(() => {
    if (kit && address) {
      getBalance();
    }
  }, [kit, address, getBalance]);

  useEffect(() => {
    if (contract) {
      getProducts();
    }
  }, [contract, getProducts]);

  return (
    <div className="App">
      <Home cUSDBalance={cUSDBalance} addProduct={addProduct} />
      <Products
        products={products}
        buyProduct={buyProduct}
        walletAddress={address}
      />
    </div>
  );
}

export default App;
