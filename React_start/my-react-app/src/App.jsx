import "./App.css";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import {Navbar} from "./components/navbar";
import {MainShop} from "./pages/eshop/eshop";
import {Shop} from "./pages/shop/shop";
import {Cart} from "./pages/cart/cart";
import {Orders} from "./pages/orders/orders";
import { MyProducts } from "./pages/myProducts/myProducts";
import { ShopContextProvider } from "./context/shop-context";
import { AuthProvider } from "./context/auth-context";
// import AuthCallback from "./pages/auth/authCallback";


function App() {

  return(

    <div className="App"> 
        <AuthProvider>
          <ShopContextProvider>
            <Router> 
              <Navbar />
              <Routes>
                <Route path ="/" element={<MainShop />}/>
                <Route path ="/products" element={<Shop/>}/>
                <Route path ="/myProducts" element={<MyProducts/>}/>
                <Route path ="/orders" element={<Orders/>}/>
                <Route path ="/cart" element={<Cart/>}/>
              </Routes>
            </Router>
          </ShopContextProvider>
        </AuthProvider>
    </div>
     
    
  );

}
export default App;
