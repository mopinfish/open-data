class TerminalEntity < BaseEntity
  expose :id, documentation: { type: Integer, desc: 'ID' }
#  expose :name, documentation: { type: String, desc: '名前' }
#  expose :age, documentation: { type: Integer, desc: '年齢' }
#  expose :emails, using: EmailEntity, documentation: { is_array: true, desc: 'メールアドレス一覧' }

  with_options(format_with: :iso_timestamp) do
    expose :created_at, documentation: { type: DateTime, desc: '作成日時' }
    expose :updated_at, documentation: { type: DateTime, desc: '更新日時' }
  end
end

