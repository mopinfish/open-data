Rails.application.routes.draw do
  root to: 'home#index'
  get '/about',   to: 'home#index'
  get '/contact', to: 'home#index'
  get '/map',     to: 'map#index'
  get '/map/terminal', to: 'map#terminal'
  get '/map',     to: 'map#index'
  get '/map', to: 'home#index'

  namespace :api, format: 'json' do
    resources :tasks, only: [:index, :create, :update]
  end
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
