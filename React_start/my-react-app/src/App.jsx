import "./App.css";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import {Navbar} from "./components/navbar";
import {MainShop} from "./pages/eshop/eshop";
import {Shop} from "./pages/shop/shop";
import {Cart} from "./pages/cart/cart";
import {Orders} from "./pages/orders/orders";
import { MyProducts } from "./pages/myProducts/myProducts";
import { ShopContextProvider } from "./context/shop-context";


function App() {

  return(

    <div className="App"> 
      <ShopContextProvider>
        <Router> 
          <Navbar />
          <Routes>
            <Route path ="/" element={<MainShop/>}/>
            <Route path ="/products" element={<Shop/>}/>
            <Route path ="/myProducts" element={<MyProducts/>}/>
            <Route path ="/orders" element={<Orders/>}/>
            <Route path ="/cart" element={<Cart/>}/>
          </Routes>
        </Router>
      </ShopContextProvider>
    </div>
     
    
  );

}
export default App;
