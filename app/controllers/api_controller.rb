class ApiController < ApplicationController

  BASE_URL = 'https://api-tokyochallenge.odpt.org'

  def show
    ignore_params = %w(controller action resource)

    query_params_hash = {}
    params.each { |key, value|
      query_params_hash[key.to_sym] = params[key] unless ignore_params.include?(key)
    }
    query_params_hash["acl:consumerKey".to_sym] = ENV["ODPT_ACCESS_TOKEN"]
    query_params = ActionController::Parameters.new(query_params_hash).permit!
    # hash形式でパラメタ文字列を指定し、URL形式にエンコード
    queries = URI.encode_www_form(query_params.to_h)

    # URIを解析し、hostやportをバラバラに取得できるようにする
    uri = URI.parse("#{BASE_URL}/api/v4/" + params[:resource] + "?#{queries}")

    # リクエストパラメタを、インスタンス変数に格納
    @query = uri.query

    # https://api-tokyochallenge.odpt.org/api/v4/odpt:BusroutePattern?odpt:operator=odpt.Operator:KantoBus&acl:consumerKey=XXXXXXX
    # 新しくHTTPセッションを開始し、結果をresponseへ格納
    http = Net::HTTP.new(uri.host, uri.port)
    # デバッグを標準出力に設定
    http.set_debug_output($stderr)
    # SSL通信設定
    http.use_ssl = true
    # 接続時に待つ最大秒数を設定
    http.open_timeout = 30
    # 読み込み一回でブロックして良い最大秒数を設定
    http.read_timeout = 30
    # ここでWebAPIを叩いている
    # Net::HTTPResponseのインスタンスが返ってくる
    response = http.get(uri.request_uri)

    # 例外処理の開始
    begin
      # responseの値に応じて処理を分ける
      case response
      # 成功した場合
      when Net::HTTPSuccess
        # 表示用の変数に結果を格納
        render :json => response.body
      # 別のURLに飛ばされた場合
      when Net::HTTPRedirection
        @message = "Redirection: code=#{response.code} message=#{response.message}"
      # その他エラー
      else
        @message = "HTTP ERROR: code=#{response.code} message=#{response.message}"
      end
    # エラー時処理
    rescue IOError => e
      @message = "e.message"
    rescue TimeoutError => e
      @message = "e.message"
    rescue JSON::ParserError => e
      @message = "e.message"
    rescue => e
      @message = "e.message"
    end
  end
end
