import "./App.css";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import {Navbar} from "./components/navbar";
import {Shop} from "./pages/shop/shop";
import {Cart} from "./pages/cart/cart";
import { MyProducts } from "./pages/myProducts/myProducts";
import { ShopContextProvider } from "./context/shop-context";

function App() {

  return(

    <div className="App"> 
      <ShopContextProvider>
        <Router> 
          <Navbar />
          <Routes>
            <Route path ="/products" element={<Shop/>}/>
            <Route path ="/myProducts" element={<MyProducts/>}/>
            <Route path ="/cart" element={<Cart/>}/>
          </Routes>

        </Router>
      </ShopContextProvider>
    </div>
     
    
  );

}
export default App;
