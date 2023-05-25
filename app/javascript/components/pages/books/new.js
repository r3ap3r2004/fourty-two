import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookForm from "../../components/book/BookForm";
import { useAddBookMutation } from "../../../data/api";

const NewBook = () => {
  const [addBook, { error: bookError, data: bookData, isLoading: isUpdating }] =
    useAddBookMutation();

  const navigate = useNavigate();

  const handleSubmit = (book) => {
    addBook(book);
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
      <div className="post-wrapper">
        <div className="post-content">
          <div className="body-copy w-richtext">
            <h1>Upload a new book</h1>
            <p>
              You can upload your own book here. The book should be in PDF
              format.
            </p>
            <p>
              Note: You can find books to play with at{" "}
              <a href="https://www.freeclassicebooks.com/index.htm">
                freeclassicebooks.com
              </a>
              .
            </p>
          </div>
          <BookForm onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  );
};

export default NewBook;
