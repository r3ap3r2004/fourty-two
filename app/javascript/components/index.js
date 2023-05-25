import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import store from "data/store";
import { Provider } from "react-redux";

import { ListBooks, ShowBook, NewBook, EditBook } from "./pages/books";
import Contact from "./pages/contact/Contact";
import Layout from "./layouts/Layout/Layout";
import About from "./pages/about/About";
import { StrictMode } from "react";
import ErrorPage from "./pages/error/Error";

export async function bookLoader({ params }) {
  const bookID = params.id;
  return { bookID };
}

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Navigate to="/books" replace />,
        },
        {
          path: "books",
          element: <ListBooks />,
        },
        {
          path: "books/:id",
          element: <ShowBook />,
          loader: bookLoader,
        },
        {
          path: "books/:id/edit",
          element: <EditBook />,
          loader: bookLoader,
        },
        {
          path: "books/new",
          element: <NewBook />,
        },
        {
          path: "about",
          element: <About />,
        },
        {
          path: "contact",
          element: <Contact />,
        },
      ],
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
