class ErrorEntity < BaseEntity
  expose :message, documentation: { type: String, desc: 'エラーメッセージ' }
end
