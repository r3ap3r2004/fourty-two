import React, { useEffect } from "react";
import { useLoaderData, Link, useNavigate } from "react-router-dom";
import BookForm from "../../components/book/BookForm";
import {
  useGetBookQuery,
  useUpdateBookMutation,
  useRemoveBookMutation,
} from "../../../data/api";

const EditBook = () => {
  const { bookID } = useLoaderData();
  const {
    data: book,
    error: error,
    isLoading: bookLoading,
  } = useGetBookQuery(bookID);
  const [
    updateBook,
    { error: bookError, data: bookData, isLoading: isUpdating },
  ] = useUpdateBookMutation();
  const [removeBook, { data: removeData, isLoading: isRemoving }] =
    useRemoveBookMutation();

  const navigate = useNavigate();

  const handleSubmit = (data) => {
    updateBook({ id: book.id, book: data });
  };

  const handleRemoveBook = () => {
    removeBook(bookID);
    navigate("/books");
  };

  useEffect(() => {
    // go to the book page if we have a bookID
    if (bookData && bookData.id) {
      // redirect to the book/:id page
      navigate(`/books/${bookData.id}`);
    }
  }, [bookData]);

  if (isUpdating)
    return (
      <div className="w-dyn-empty">
        <p>Saving...</p>
      </div>
    );

  if (bookError)
    return (
      <div className="w-dyn-empty">
        <p>{bookError}</p>
      </div>
    );

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "right",

          marginBottom: "20px",
        }}
      >
        <div
          className="button-wrapper"
          style={{ display: "flex", alignSelf: "flex-end" }}
        >
          <button onClick={handleRemoveBook} className="button w-button">
            Delete Book
          </button>
        </div>
      </div>
      <div className="post-wrapper">
        <div className="post-content">
          <BookForm book={book} onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  );
};

export default EditBook;
