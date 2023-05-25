# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :questions, only: %i[] do
        member do
          post :resemble_callback
        end
      end
      resources :books, only: %i[index show create update destroy] do
        resources :questions, only: %i[create show] do
          collection do
            get :feeling_lucky
          end
        end
      end
      post '/contact', to: 'contact#create'
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
