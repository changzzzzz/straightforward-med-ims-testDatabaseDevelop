import { Route } from "@/ims/types/routes.types";
import SearchAndHistoryPage from "./apps/dashboard/inventory/PatientHistory/SearchAndHistoryPage";


import {
  Dashboard,
  Auth,
  Inventory,
  HomePage,
} from "./apps/apps.module";

import { ReportsPage } from "./apps/dashboard/reports";
import { DashboardPage } from "./apps/dashboard/dashboard";
export const routes: Route[] = [
  {
    path: "/login",
    element: Auth.Login,
  },
  {
    path: "/registration",
    element: Auth.Registration,
  },
  {
    path: "/",
    element: HomePage,
  },
  {
    path: "/dashboard",
    element: Dashboard,
    children: [
      {
        path: "/dashboard",
        element: DashboardPage,
      },
      {
        path: "/dashboard/inventory/WPTAS",
        element: Inventory.InventoryPages.WPTAS,
      },
      {
        path: "/dashboard/inventory/ABS",
        element: Inventory.InventoryPages.ABS,
      },
      {
        path: "/dashboard/inventory/PatientHistory/SearchAndHistoryPage",
        element: Inventory.InventoryPages.SearchAndHistoryPage,
      },
      {
        path: "/dashboard/reports",
        element: ReportsPage,
      },
      {
        path: "*",
        element: () => <h1>You are unathorized to access this page</h1>,
      },
    ],
  },
  {
    path: "*",
    element: () => <h1>You are unathorized to access this page</h1>,
  },
];





