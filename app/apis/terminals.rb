class Terminals < Grape::API
  # pathが/users
  resources :terminals do
    desc 'get terminals' do
      # リクエストヘッダーで指定可能な内容
      headers({ :'X-Custom-Header' => { description: 'custom header', required: false } })
      # 処理成功時のレスポンスの内容。TerminalEntityは app/apis/terminal_entity.rb に定義されている
      success TerminalEntity
      # 処理失敗時に返す可能性があるステータスコードとレスポンスの内容
      failure [
                [400, 'Validation error', ErrorEntity],
                [500, 'Server error', ErrorEntity],
              ]
    end
    # リクエストパラメーターで指定可能な内容
    params do
#      requires :name, type: String, documentation: { param_type: 'body' }
#      requires :age, type: Integer, documentation: { param_type: 'body' }
#      optional :emails_attributes, type: Array, documentation: { param_type: 'body' } do
#        requires :mail_address, type: String, documentation: { param_type: 'body' }
#      end
    end
  end
end
