import { createBrowserRouter } from "react-router";
import Layout from "./Layout";
import HomePage from "./pages/Home";
import SafeAtHome from "./pages/SafeAtHome";
import HandymanSpecial from "./pages/HandymanSpecial";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "safe-at-home", Component: SafeAtHome },
      { path: "handyman-special", Component: HandymanSpecial },
    ],
  },
]);
