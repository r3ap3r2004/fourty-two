class CreateBooks < ActiveRecord::Migration[7.0]
  def change
    create_table :books do |t|
      t.string :title
      t.string :author
      t.boolean :processing, default: true, null: false
      t.text :summary
      t.text :hint

      t.timestamps
    end
  end
end
