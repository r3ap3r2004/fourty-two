# frozen_string_literal: true

Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'users/sessions'
  }

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
  mount Sidekiq::Web, at: '/sidekiq'

  # Our catch all route is preventing ActiveStorage from working properly in development
  get '/rails/active_storage/blobs/redirect/:signed_id/*filename' => 'active_storage/blobs/redirect#show',
      as: :rails_service_blob_2
  get '/rails/active_storage/blobs/proxy/:signed_id/*filename' => 'active_storage/blobs/proxy#show',
      as: :rails_service_blob_proxy_2
  get '/rails/active_storage/blobs/:signed_id/*filename' => 'active_storage/blobs/redirect#show'

  get '/rails/active_storage/representations/redirect/:signed_blob_id/:variation_key/*filename' => 'active_storage/representations/redirect#show',
      as: :rails_blob_representation_2
  get '/rails/active_storage/representations/proxy/:signed_blob_id/:variation_key/*filename' => 'active_storage/representations/proxy#show',
      as: :rails_blob_representation_proxy_2
  get '/rails/active_storage/representations/:signed_blob_id/:variation_key/*filename' => 'active_storage/representations/redirect#show'

  get  '/rails/active_storage/disk/:encoded_key/*filename' => 'active_storage/disk#show',
       as: :rails_disk_service_2
  put  '/rails/active_storage/disk/:encoded_token' => 'active_storage/disk#update',
       as: :update_rails_disk_service_2
  post '/rails/active_storage/direct_uploads' => 'active_storage/direct_uploads#create',
       as: :rails_direct_uploads_2

  mount ActionCable.server => '/api/v1/cable'

  # Defines the root path route ("/")
  root 'home#index'

  # catch all route for the frontend
  match '*path', to: 'home#index', via: :all
end
