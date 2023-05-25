json.extract! book, :id, :title, :author, :created_at, :updated_at, :summary, :processing, :hint
if book.cover.attached? && book.cover.variable?
  json.cover_image polymorphic_url(book.cover.variant(:thumb),
                                   host: ENV.fetch('HOST', 'localhost:3000'))
end
json.model_type :book
