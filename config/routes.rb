Rails.application.routes.draw do
  root            to: 'home#index'
  get '/contact', to: 'home#index'
  get '/about',   to: 'home#index'
  get '/api/v4/:resource',   to: 'api#show'
end
