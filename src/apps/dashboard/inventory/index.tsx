// import Main from "./main";
import Outlet from "./outlet";


import WPTAS from "./WPTAS";
import ABS from "./ABS";
import SearchAndHistoryPage from "./PatientHistory/SearchAndHistoryPage"



const InventoryPages = {
  WPTAS,
  ABS,
  SearchAndHistoryPage,
};

const InventoryPageRenderer = {
  // Main,
  Outlet,
};

export { InventoryPageRenderer, InventoryPages };
