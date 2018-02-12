Rails.application.routes.draw do
  root            to: 'home#index'
  get '/contact', to: 'home#index'
  get '/about',   to: 'home#index'
end
