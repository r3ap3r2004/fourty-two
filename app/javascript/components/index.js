import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import store from "data/store";
import { Provider } from "react-redux";

import Layout from "./layouts/Layout/Layout";
import { StrictMode } from "react";
import ErrorPage from "./pages/error/Error";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [],
    },
  ]);

  return (
    <StrictMode>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </StrictMode>
  );
};

export default App;
