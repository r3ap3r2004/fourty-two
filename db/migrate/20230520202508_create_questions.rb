class CreateQuestions < ActiveRecord::Migration[7.0]
  def change
    create_table :questions do |t|
      t.belongs_to :book, null: false, foreign_key: true
      t.integer :ask_count, null: false, default: 0
      t.boolean :audio_processing, null: false, default: true
      t.string :audio_src_url
      t.string :audio_id
      t.integer :runtime, null: false, default: 0
      t.text :question, index: true, null: false
      t.text :answer, null: false
      t.text :context, null: false

      t.timestamps
    end
  end
end
