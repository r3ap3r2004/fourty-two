import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const isMessage = (arg) => {
  if (arg.identifier === '{"channel":"BooksChannel"}') {
    return true;
  }
  if (arg.type === "confirm_subscription") {
    return false;
  }
  return false;
};

export const booksApi = createApi({
  reducerPath: "booksApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  endpoints: (builder) => ({
    getBooks: builder.query({
      query: () => "/books.json",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Book", id: id })),
              { type: "Book", id: "LIST" },
            ]
          : [{ type: "Book", id: "LIST" }],
    }),
    getBook: builder.query({
      query: (id) => {
        return `/books/${id}.json`;
      },
      providesTags: (result, error, id) => [{ type: "Book", id: id }],

      async onCacheEntryAdded(arg, { updateCachedData, cacheEntryRemoved }) {
        const url = document.querySelector(
          'meta[name="action-cable-url"]'
        ).content;
        // create a websocket connection when the cache subscription starts
        const ws = new WebSocket(url);
        try {
          // when data is received from the socket connection to the server,
          // if it is a message and for the appropriate channel,
          // update our query result with the received message
          const listener = (event) => {
            const outerData = JSON.parse(event.data);
            if (!isMessage(outerData) || !outerData.message) return;

            const data = JSON.parse(outerData.message);

            if (data.model_type === "book") {
              updateCachedData((draft) => {
                Object.assign(draft, data);
              });
            }
          };

          ws.addEventListener("open", () => {
            // subscribe to the appropriate channel
            ws.send(
              JSON.stringify({
                command: "subscribe",
                identifier: '{"channel":"BooksChannel"}',
              })
            );
          });

          ws.addEventListener("message", listener);
        } catch {
          // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
          // in which case `cacheDataLoaded` will throw
        }
        // cacheEntryRemoved will resolve when the cache subscription is no longer active
        await cacheEntryRemoved;
        // perform cleanup steps once the `cacheEntryRemoved` promise resolves
        ws.close();
      },
    }),
    addBook: builder.mutation({
      query: (formData) => ({
        url: `/books.json`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Book", id: "LIST" }],
    }),
    updateBook: builder.mutation({
      query: ({ id, book }) => ({
        url: `/books/${id}.json`,
        method: "PATCH",
        body: book,
      }),
      invalidatesTags: (result, error, { id }) => {
        return [
          { type: "Book", id: "LIST" },
          {
            type: "Book",
            id: id,
          },
        ];
      },
    }),
    removeBook: builder.mutation({
      query: (id) => ({
        url: `/books/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Book", id: "LIST" }],
    }),
    streamMessages: builder.query({
      queryFn: () => {
        return { data: {} };
      },
      async onCacheEntryAdded(arg, { updateCachedData, cacheEntryRemoved }) {
        const url = document.querySelector(
          'meta[name="action-cable-url"]'
        ).content;
        // create a websocket connection when the cache subscription starts
        const ws = new WebSocket(url);
        try {
          // when data is received from the socket connection to the server,
          // if it is a message and for the appropriate channel,
          // update our query result with the received message
          const listener = (event) => {
            const outerData = JSON.parse(event.data);
            if (!isMessage(outerData) || !outerData.message) return;

            const data = JSON.parse(outerData.message);

            updateCachedData((draft) => {
              Object.assign(draft, data);
            });
          };

          ws.addEventListener("open", () => {
            // subscribe to the appropriate channel
            ws.send(
              JSON.stringify({
                command: "subscribe",
                identifier: '{"channel":"QuestionsChannel"}',
              })
            );
          });

          ws.addEventListener("message", listener);
        } catch {
          // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
          // in which case `cacheDataLoaded` will throw
        }
        // cacheEntryRemoved will resolve when the cache subscription is no longer active
        await cacheEntryRemoved;
        // perform cleanup steps once the `cacheEntryRemoved` promise resolves
        ws.close();
      },
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetBookQuery,
  useAddBookMutation,
  useUpdateBookMutation,
  useRemoveBookMutation,
  useStreamMessagesQuery,
} = booksApi;
