import React from "react";
import { Link } from "react-router-dom";
import Book from "../../components/book/Book";
import { useGetBooksQuery } from "../../../data/api";

const ListBooks = () => {
  // need to fetch the books from the backend
  const { data, error, isLoading } = useGetBooksQuery();

  const bookList = () => {
    return data.map((book) => {
      return (
        <div role="listitem" className="w-dyn-item" key={"book_" + book.id}>
          <Book
            title={book.title}
            author={book.author}
            id={book.id}
            coverImage={book.cover_image}
            summary={book.summary}
          />
        </div>
      );
    });
  };

  const noBooks = () => {
    return (
      <div className="w-dyn-empty">
        <p>No items found.</p>
      </div>
    );
  };

  const hasBooks = () => {
    return (
      <div role="list" className="w-dyn-items">
        {bookList()}
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="w-dyn-empty">
        <p>Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="w-dyn-empty">
        <p>{error}</p>
      </div>
    );

  return (
    <>
      <div
        className="button-wrapper"
        style={{ textAlign: "right", marginBottom: "10px" }}
      >
        <Link to={"/books/new"} className="button w-button">
          Add a new book
        </Link>
      </div>
      <div className="w-dyn-list">
        {data && data.length > 0 ? hasBooks() : noBooks()}
      </div>
    </>
  );
};

export default ListBooks;
